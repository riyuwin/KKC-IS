require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const urlDB = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQL_ROOT_PASSWORD}@${process.env.RAILWAY_TCP_PROXY_DOMAIN}:${process.env.RAILWAY_TCP_PROXY_PORT}/${process.env.MYSQL_DATABASE}`

const db = mysql.createPool(urlDB);

/* 
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,           // use private domain
    user: process.env.MYSQLUSER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,           // usually 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

 */

/* 
For Localhost Debugging ---->>>

const db = mysql.createPool({
    host: process.env.VITE_DB_HOST,
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    database: process.env.VITE_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
 */

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
    } else {
        console.log("Connected to MySQL database.");
        connection.release();
    }
});

app.use(
    cors({
        origin: process.env.VITE_DB_FRONTEND_HOST,
        credentials: true,
    })
);

app.use(session({
    secret: process.env.VITE_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax"
    }
}));

function executeQuery(query, params, res, messageContent) {
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        connection.query(query, params, (err, result) => {
            connection.release();

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: messageContent,
                affectedRows: result.affectedRows,
                insertId: result.insertId || null
            });
        });
    });
}

// Auth ->>>>>>>>>>>>
app.post("/create_account", (req, res) => {
    const { warehouse_id, fullname, username, email, password, role } = req.body;

    db.query("SELECT * FROM accounts WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("Email Check Error:", err);
            return res.status(500).json({ error: "Internal server error." });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Email is already taken." });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Password Hashing Error:", err);
                return res.status(500).json({ error: "Failed to hash password." });
            }

            const insertAccountQuery = `
                INSERT INTO accounts 
                (warehouse_id, fullname, username, email, password, role, added_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;

            const params = [warehouse_id, fullname, username, email, hashedPassword, role];

            executeQuery(insertAccountQuery, params, res, "Account created successfully");
        });
    });
});

app.get("/accounts", (req, res) => {
    db.query("SELECT * FROM accounts", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.put("/accounts", (req, res) => {
    const { account_id, warehouse_id, fullname, username, email, password, role, added_at } = req.body;

    let updateAccountQuery;
    let params;
    const messageContent = "Account updated successfully";

    if (password && password.trim() !== "") {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Password Hashing Error:", err);
                return res.status(500).json({ error: "Failed to hash password." });
            }

            updateAccountQuery = `
                UPDATE accounts  
                SET warehouse_id = ?, fullname = ?, username = ?, email = ?, password = ?, role = ?, added_at = ?, updated_at = NOW()
                WHERE account_id = ?
            `;
            params = [warehouse_id, fullname, username, email, hashedPassword, role, added_at, account_id];
            executeQuery(updateAccountQuery, params, res, messageContent);
        });
    } else {
        updateAccountQuery = `
            UPDATE accounts  
            SET warehouse_id = ?, fullname = ?, username = ?, email = ?, role = ?, added_at = ?, updated_at = NOW()
            WHERE account_id = ?
        `;
        params = [warehouse_id, fullname, username, email, role, added_at, account_id];
        executeQuery(updateAccountQuery, params, res, messageContent);
    }
});

app.delete("/accounts", (req, res) => {
    const { account_id } = req.body;

    if (!account_id) {
        return res.status(400).json({ error: "Account ID is required." });
    }

    const deleteAccountQuery = "DELETE FROM accounts WHERE account_id = ?";

    executeQuery(deleteAccountQuery, [account_id], res, "Account deleted successfully!");
});


app.post("/login", (req, res) => {
    console.log("Incoming body:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password." });
    }

    db.query("SELECT * FROM accounts WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal server error." });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const user = results[0];
        console.log("User from DB:", user);

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Password Comparison Error:", err);
                return res.status(500).json({ error: "Internal server error." });
            }

            if (!isMatch) {
                return res.status(400).json({ error: "Invalid email or password." });
            }

            if (!req.session) {
                console.error("Session not initialized!");
            }

            req.session.user = { account_id: user.account_id, email: user.email, role: user.role };
            console.log("Session Created:", req.session.user);

            res.json({ message: "Login successful", account_id: user.account_id, email: user.email, role: user.role });
        });
    });
});

app.get("/session", (req, res) => {
    if (req.session.user) {
        console.log("Active Session:", req.session);
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        console.log("No active session");
        res.json({ loggedIn: false });
    }
});

app.post("/logout", (req, res) => {
    if (!req.session) {
        return res.status(400).json({ error: "No active session" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Warehouse ->>>>>>>>>>>>
app.post("/warehouse", (req, res) => {
    const { warehouse_name, location } = req.body;

    if (!warehouse_name || !location) {
        return res.status(400).json({ error: "Missing warehouse name or location." });
    }

    const insertWarehouseQuery = `
        INSERT INTO warehouse (warehouse_name, location, added_at)
        VALUES (?, ?, NOW())
    `;

    executeQuery(
        insertWarehouseQuery,
        [warehouse_name, location],
        res,
        "Warehouse added successfully"
    );
});

app.put("/warehouse", (req, res) => {
    const { warehouse_id, warehouse_name, location } = req.body;

    if (!warehouse_id || !warehouse_name || !location) {
        return res.status(400).json({ error: "Missing warehouse ID, name, or location." });
    }

    const updateWarehouseQuery = `
        UPDATE warehouse 
        SET warehouse_name = ?, location = ?, added_at = NOW() 
        WHERE warehouse_id = ?
    `;

    executeQuery(
        updateWarehouseQuery,
        [warehouse_name, location, warehouse_id],
        res,
        "Warehouse updated successfully"
    );
});

app.delete("/warehouse", (req, res) => {
    const { warehouseId } = req.body;

    if (!warehouseId) {
        return res.status(400).json({ error: "Warehouse ID is required." });
    }

    const deleteWarehouseQuery = "DELETE FROM warehouse WHERE warehouse_id = ?";

    executeQuery(deleteWarehouseQuery, [warehouseId], res, "Warehouse deleted successfully!");
});


app.get("/warehouse", (req, res) => {
    db.query("SELECT * FROM warehouse", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// PRODUCTS HELPERS 
function computeStockStatus(stock) {
    if (!Number.isFinite(stock) || stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
}

async function generateUniqueSku(db) {
    function makeSku() {
        let s = '';
        for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10);
        return s;
    }
    const query = (sql, params) =>
        new Promise((resolve, reject) =>
            db.query(sql, params, (e, r) => (e ? reject(e) : resolve(r)))
        );

    let attempts = 0;
    while (attempts < 5) {
        const sku = makeSku();
        const rows = await query('SELECT product_id FROM products WHERE sku = ?', [sku]);
        if (rows.length === 0) return sku;
        attempts++;
    }
    throw new Error('Failed to generate unique SKU');
}

// PRODUCTS

// GET /products?search=...
app.get('/products', (req, res) => {
    const search = (req.query.search || '').trim();
    const like = `%${search}%`;
    const sql = `
    SELECT p.product_id, p.sku, p.product_name, p.description, p.unit,
           p.stock, p.cost_price, p.selling_price, p.stock_status,
           s.supplier_id, s.supplier_name
    FROM products p
    LEFT JOIN suppliers s ON s.supplier_id = p.supplier_id
    ${search ? 'WHERE p.product_name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?' : ''}
    ORDER BY p.created_at DESC
  `;
    const params = search ? [like, like, like] : [];
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /products
app.post('/products', async (req, res) => {
    try {
        let { sku, product_name, description, unit, stock, supplier_id, cost_price, selling_price } = req.body;

        if (!product_name) return res.status(400).json({ error: 'product_name is required' });

        stock = parseInt(stock ?? 0, 10) || 0;
        cost_price = parseFloat(cost_price ?? 0) || 0;
        selling_price = parseFloat(selling_price ?? 0) || 0;

        if (!sku) sku = await generateUniqueSku(db);

        const stock_status = computeStockStatus(stock);

        const sql = `
      INSERT INTO products (sku, product_name, description, unit, stock, supplier_id, cost_price, selling_price, stock_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [sku, product_name, description || null, unit || null, stock, supplier_id || null, cost_price, selling_price, stock_status];

        db.query(sql, params, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product created', product_id: result.insertId, sku, stock_status });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PUT /products/:id
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    let { product_name, description, unit, stock, supplier_id, cost_price, selling_price } = req.body;

    stock = parseInt(stock ?? 0, 10) || 0;
    cost_price = parseFloat(cost_price ?? 0) || 0;
    selling_price = parseFloat(selling_price ?? 0) || 0;

    const stock_status = computeStockStatus(stock);

    const sql = `
    UPDATE products
       SET product_name = ?, description = ?, unit = ?, stock = ?, supplier_id = ?,
           cost_price = ?, selling_price = ?, stock_status = ?
     WHERE product_id = ?
  `;
    const params = [product_name, description, unit, stock, supplier_id || null, cost_price, selling_price, stock_status, id];

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated', stock_status });
    });
});

// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE product_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

// SUPPLIERS

app.get('/suppliers', (req, res) => {
    db.query('SELECT supplier_id, supplier_name FROM suppliers ORDER BY supplier_name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// ====== PURCHASES HELPERS ======
function recomputePurchaseStatus(quantity, qty_received) {
    const remaining = Math.max(0, Number(quantity || 0) - Number(qty_received || 0));
    return remaining === 0 ? 'Completed' : 'Pending';
}
function computeStockStatus(stock) { // reuse if not in scope here
    if (!Number.isFinite(stock) || stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
}

function toInt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}
function toMoney(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

// Record stock movement and update product stock (for received qty only)
function applyReceivedToStock({ product_id, qty_received_delta, purchase_id }, cb) {
    const delta = toInt(qty_received_delta);         // <— force integer here
    const pid = toInt(product_id);                 // <— ensure ID is numeric

    if (!Number.isFinite(delta) || delta === 0) return cb?.(null);

    db.getConnection((err, conn) => {
        if (err) return cb?.(err);

        conn.beginTransaction((err) => {
            if (err) { conn.release(); return cb?.(err); }

            conn.query(
                'UPDATE products SET stock = stock + ? WHERE product_id = ?',
                [delta, pid],                                 // <— guaranteed integer
                (e) => {
                    if (e) return conn.rollback(() => { conn.release(); cb?.(e); });

                    conn.query(
                        'INSERT INTO stock_movements (product_id, quantity, movement_type, purchase_id) VALUES (?,?,?,?)',
                        [pid, delta, 'purchase', toInt(purchase_id)],
                        (e2) => {
                            if (e2) return conn.rollback(() => { conn.release(); cb?.(e2); });

                            conn.query('SELECT stock FROM products WHERE product_id=?', [pid], (e3, rows) => {
                                if (e3) return conn.rollback(() => { conn.release(); cb?.(e3); });
                                const stock = toInt(rows?.[0]?.stock);
                                const ss = computeStockStatus(stock);

                                conn.query('UPDATE products SET stock_status=? WHERE product_id=?', [ss, pid], (e4) => {
                                    if (e4) return conn.rollback(() => { conn.release(); cb?.(e4); });
                                    conn.commit((e5) => { conn.release(); cb?.(e5 || null); });
                                });
                            });
                        }
                    );
                }
            );
        });
    });
}

// ====== PURCHASES API ======
// GET /purchases?search=...
app.get('/purchases', (req, res) => {
    const search = (req.query.search || '').trim();
    const like = `%${search}%`;

    const sql = `
    SELECT 
      pu.purchase_id,
      pu.purchase_date,
      pu.supplier_id,
      s.supplier_name,
      pu.total_cost AS purchase_total_cost,
      pu.purchase_status,
      pu.purchase_payment_status,

      pi.purchase_item_id,
      pi.product_id,
      p.product_name,
      p.sku,
      pi.quantity,
      pi.qty_received,
      (pi.quantity - pi.qty_received) AS remaining,
      pi.unit_cost,
      pi.total_cost
    FROM purchases pu
    JOIN suppliers s ON s.supplier_id = pu.supplier_id
    JOIN purchase_items pi ON pi.purchase_id = pu.purchase_id
    JOIN products p ON p.product_id = pi.product_id
    ${search ? 'WHERE s.supplier_name LIKE ? OR p.product_name LIKE ?' : ''}
    ORDER BY pu.created_at DESC, pu.purchase_id DESC
  `;
    const params = search ? [like, like] : [];
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /purchases  (create one purchase + one item)
app.post('/purchases', (req, res) => {
    const {
        purchase_date,
        supplier_id,
        product_id,
        quantity,
        unit_cost,
        qty_received = 0,
        purchase_payment_status = 'Unpaid'
    } = req.body;

    const qty = toInt(quantity);
    const recv = toInt(qty_received);
    const ucost = toMoney(unit_cost);
    const item_total = qty * ucost;
    const purchase_status = recomputePurchaseStatus(qty, recv);

    if (!purchase_date || !supplier_id || !product_id || qty <= 0 || ucost < 0) {
        return res.status(400).json({ error: 'Missing or invalid fields.' });
    }

    db.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: err.message });

        conn.beginTransaction((err) => {
            if (err) { conn.release(); return res.status(500).json({ error: err.message }); }

            conn.query(
                `INSERT INTO purchases (purchase_date, supplier_id, total_cost, purchase_status, purchase_payment_status)
         VALUES (?,?,?,?,?)`,
                [purchase_date, supplier_id, item_total, purchase_status, purchase_payment_status],
                (e, result) => {
                    if (e) return conn.rollback(() => { conn.release(); res.status(500).json({ error: e.message }); });

                    const newPurchaseId = result.insertId;

                    conn.query(
                        `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost, qty_received)
             VALUES (?,?,?,?,?,?)`,
                        [newPurchaseId, product_id, qty, ucost, item_total, recv],
                        (e2) => {
                            if (e2) return conn.rollback(() => { conn.release(); res.status(500).json({ error: e2.message }); });

                            conn.commit((e3) => {
                                conn.release();
                                // Apply stock movement after commit (safe side)
                                applyReceivedToStock({ product_id, qty_received_delta: recv, purchase_id: newPurchaseId }, (e4) => {
                                    if (e4) return res.status(500).json({ error: e4.message });
                                    res.json({ message: 'Purchase created', purchase_id: newPurchaseId });
                                });
                            });
                        }
                    );
                }
            );
        });
    });
});

// PUT /purchases/:id  (update one purchase + its single item)
app.put('/purchases/:id', (req, res) => {
    const { id } = req.params;
    const {
        purchase_date,
        supplier_id,
        product_id,
        quantity,
        unit_cost,
        qty_received,
        purchase_status,            // optional override, otherwise recomputed
        purchase_payment_status     // Unpaid | Partially Paid | Fully Paid
    } = req.body;

    const qty = toInt(quantity);
    const recv = toInt(qty_received);
    const ucost = toMoney(unit_cost);
    const item_total = qty * ucost;
    const status = purchase_status || recomputePurchaseStatus(qty, recv);

    db.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: err.message });

        conn.beginTransaction((err) => {
            if (err) { conn.release(); return res.status(500).json({ error: err.message }); }

            // find existing item to compute delta received
            conn.query(
                `SELECT pi.product_id, pi.qty_received
         FROM purchase_items pi
         WHERE pi.purchase_id=? LIMIT 1`,
                [id],
                (e0, rows0) => {
                    if (e0) return conn.rollback(() => { conn.release(); res.status(500).json({ error: e0.message }); });

                    const prev = rows0?.[0];
                    const prevRecv = Number(prev?.qty_received || 0);
                    const prevProductId = Number(prev?.product_id || product_id);
                    const recvDelta = recv - prevRecv;

                    conn.query(
                        `UPDATE purchases
               SET purchase_date=?, supplier_id=?, total_cost=?, purchase_status=?, purchase_payment_status=?
             WHERE purchase_id=?`,
                        [purchase_date, supplier_id, item_total, status, purchase_payment_status, id],
                        (e1) => {
                            if (e1) return conn.rollback(() => { conn.release(); res.status(500).json({ error: e1.message }); });

                            conn.query(
                                `UPDATE purchase_items
                   SET product_id=?, quantity=?, unit_cost=?, total_cost=?, qty_received=?
                 WHERE purchase_id=?`,
                                [product_id, qty, ucost, item_total, recv, id],
                                (e2) => {
                                    if (e2) return conn.rollback(() => { conn.release(); res.status(500).json({ error: e2.message }); });

                                    conn.commit((e3) => {
                                        conn.release();
                                        // Adjust stock for the delta
                                        applyReceivedToStock({ product_id, qty_received_delta: recvDelta, purchase_id: id }, (e4) => {
                                            if (e4) return res.status(500).json({ error: e4.message });
                                            res.json({ message: 'Purchase updated' });
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });
});

// DELETE /purchases/:id  (removes purchase + item; NOTE: does NOT auto reverse stock)
app.delete('/purchases/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM purchases WHERE purchase_id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Purchase deleted' });
    });
});



app.listen(process.env.VITE_PORT, () => console.log(`Server running on port ${process.env.VITE_PORT}`));

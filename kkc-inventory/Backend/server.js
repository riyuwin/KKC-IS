require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");

const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

app.use(
    cors({
        origin: process.env.DB_FRONTEND_HOST, //"http://localhost:5173", // frontend URL
        credentials: true,               // allow cookies/session
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 
WIPPPP
const urlDB = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQL_ROOT_PASSWORD}@${process.env.RAILWAY_TCP_PROXY_DOMAIN}:${process.env.RAILWAY_TCP_PROXY_PORT}/${process.env.MYSQL_DATABASE}`

const db = mysql.createPool(urlDB);

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
*/
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
    } else {
        console.log("Connected to MySQL database.");
        connection.release();
    }
});

app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,   // true kapag naka-HTTPS
            httpOnly: true,
            sameSite: "lax",
        },
    })
);

function executeQueryWithCallback(query, params, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            console.error("Connection error:", err);
            return callback(err);
        }

        connection.query(query, params, (err, results) => {
            connection.release(); // release back to pool

            if (err) {
                console.error("Database error:", err);
                return callback(err);
            }
            callback(null, results);
        });
    });
}


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

            req.session.user = { account_id: user.account_id, fullname: user.fullname, username: user.username, email: user.email, role: user.role };
            console.log("Session Created:", req.session.user);

            res.json({ message: "Login successful", account_id: user.account_id, fullname: user.fullname, username: user.username, email: user.email, role: user.role });
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
    if (!req.session.user) {
        return res.status(400).json({ error: "No active session" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
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

// GET /suppliers?search=...
app.get('/suppliers', (req, res) => {
    const search = (req.query.search || '').trim();
    const like = `%${search}%`;

    const sql = `
    SELECT supplier_id, supplier_name, contact_name, contact_number, email, address
    FROM suppliers
    ${search ? `WHERE supplier_name LIKE ? OR contact_name LIKE ? OR contact_number LIKE ? OR email LIKE ? OR address LIKE ?` : ''}
    ORDER BY supplier_name ASC
  `;
    const params = search ? [like, like, like, like, like] : [];

    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /suppliers
app.post('/suppliers', (req, res) => {
    const { supplier_name, contact_name, contact_number, email, address } = req.body;

    if (!supplier_name || supplier_name.trim() === '') {
        return res.status(400).json({ error: 'supplier_name is required' });
    }

    const sql = `
    INSERT INTO suppliers (supplier_name, contact_name, contact_number, email, address)
    VALUES (?,?,?,?,?)
  `;
    const params = [
        supplier_name.trim(),
        contact_name || null,
        contact_number || null,
        email || null,
        address || null
    ];

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Supplier created', supplier_id: result.insertId });
    });
});

// PUT /suppliers/:id
app.put('/suppliers/:id', (req, res) => {
    const { id } = req.params;
    const { supplier_name, contact_name, contact_number, email, address } = req.body;

    if (!supplier_name || supplier_name.trim() === '') {
        return res.status(400).json({ error: 'supplier_name is required' });
    }

    const sql = `
    UPDATE suppliers
       SET supplier_name=?, contact_name=?, contact_number=?, email=?, address=?
     WHERE supplier_id=?
  `;
    const params = [
        supplier_name.trim(),
        contact_name || null,
        contact_number || null,
        email || null,
        address || null,
        id
    ];

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Supplier updated' });
    });
});

// DELETE /suppliers/:id
app.delete('/suppliers/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM suppliers WHERE supplier_id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Supplier deleted' });
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

    getSessionWarehouseId(req, (eWh, whId) => {
        if (eWh || !whId) return res.status(401).json({ error: 'No warehouse for session' });

        db.getConnection((err, conn) => {
            if (err) return res.status(500).json({ error: err.message });

            conn.beginTransaction((err) => {
                if (err) { conn.release(); return res.status(500).json({ error: err.message }); }

                conn.query(
                    `INSERT INTO purchases
             (purchase_date, warehouse_id, supplier_id, total_cost, purchase_status, purchase_payment_status)
           VALUES (?,?,?,?,?,?)`,
                    [purchase_date, whId, supplier_id, item_total, purchase_status, purchase_payment_status],
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
        purchase_status,
        purchase_payment_status
    } = req.body;

    const qty = toInt(quantity);
    const recv = toInt(qty_received);
    const ucost = toMoney(unit_cost);
    const item_total = qty * ucost;
    const status = purchase_status || recomputePurchaseStatus(qty, recv);

    getSessionWarehouseId(req, (eWh, whId) => {
        if (eWh || !whId) return res.status(401).json({ error: 'No warehouse for session' });

        db.getConnection((err, conn) => {
            if (err) return res.status(500).json({ error: err.message });

            conn.beginTransaction((err) => {
                if (err) { conn.release(); return res.status(500).json({ error: err.message }); }

                conn.query(
                    `SELECT pi.product_id, pi.qty_received
             FROM purchase_items pi
            WHERE pi.purchase_id=? LIMIT 1`,
                    [id],
                    (e0, rows0) => {
                        if (e0) return conn.rollback(() => { conn.release(); res.status(500).json({ error: e0.message }); });

                        const prevRecv = Number(rows0?.[0]?.qty_received || 0);
                        const recvDelta = recv - prevRecv;

                        conn.query(
                            `UPDATE purchases
                  SET purchase_date=?, warehouse_id=?, supplier_id=?, total_cost=?, purchase_status=?, purchase_payment_status=?
                WHERE purchase_id=?`,
                            [purchase_date, whId, supplier_id, item_total, status, purchase_payment_status, id],
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
});


// DELETE /purchases/:id  (removes purchase + item; NOTE: does NOT auto reverse stock)
app.delete('/purchases/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM purchases WHERE purchase_id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Purchase deleted' });
    });
});

// Sales ->>>>>>>>>>>>  
app.post("/sales", upload.array("attachments"), (req, res) => {
    const { account_id, warehouse_id, product_id, sale_date, customer_name, product_quantity, total_sale, sale_payment_status, total_delivery_quantity, total_delivered, delivery_status } = req.body;
    const attachments = req.files;  // Multer array of files 

    if (!account_id || !warehouse_id || !product_id || !sale_date || !customer_name || product_quantity == null || total_sale == null || !sale_payment_status || total_delivery_quantity == null || total_delivered == null || !delivery_status) {
        return res.status(400).json({ error: "Missing required information." });
    }

    const productQuantity = Number(product_quantity);

    const insertSalesQuery = `
    INSERT INTO sales (account_id, warehouse_id, sale_date, customer_name, total_sale, delivery_status, sale_payment_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

    const insertSalesItemQuery = `
    INSERT INTO sales_item (sales_id, product_id, product_quantity, created_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW())
  `;

    const insertSalesDeliveriesQuery = `
    INSERT INTO sales_deliveries (sales_item_id, total_delivery_quantity, total_delivered, created_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW())
  `;

    const insertAttachmentsQuery = `
    INSERT INTO sales_attachments (sales_delivery_id, file, file_name, uploaded_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW())
  `;

    executeQueryWithCallback(
        insertSalesQuery,
        [account_id, warehouse_id, sale_date, customer_name, total_sale, delivery_status, sale_payment_status,],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to insert sales" });
            }

            const salesId = result.insertId;

            executeQueryWithCallback(
                insertSalesItemQuery,
                [salesId, product_id, productQuantity],
                (err2, result2) => {
                    if (err2) {
                        return res.status(500).json({ error: "Failed to insert sales item" });
                    }

                    const salesItemId = result2.insertId;

                    executeQueryWithCallback(
                        insertSalesDeliveriesQuery,
                        [salesItemId, total_delivery_quantity, total_delivered],
                        (err3, result3) => {
                            if (err3) {
                                return res
                                    .status(500)
                                    .json({ error: "Failed to insert sales delivery" });
                            }

                            const salesDeliveryId = result3.insertId;

                            const promises = attachments.map((file) => {
                                return new Promise((resolve, reject) => {
                                    executeQueryWithCallback(
                                        insertAttachmentsQuery,
                                        [salesDeliveryId, file.buffer, file.originalname], // use originalname or file.buffer if storing file in DB
                                        (err4) => {
                                            if (err4) reject(err4);
                                            else resolve();
                                        }
                                    );
                                });
                            });

                            Promise.all(promises)
                                .then(() => {
                                    res.json({
                                        message:
                                            "Sales, item, delivery, and attachments added successfully",
                                    });
                                })
                                .catch(() => {
                                    res.status(500).json({ error: "Failed to insert attachments" });
                                });
                        }
                    );
                }
            );
        }
    );
});

app.put("/sales/:id", upload.array("attachments"), (req, res) => {
    const salesId = req.params.id;
    const {
        account_id,
        warehouse_id,
        product_id,
        sale_date,
        customer_name,
        product_quantity,
        total_sale,
        sale_payment_status,
        total_delivery_quantity,
        total_delivered,
        delivery_status,
        attachments_id, // IDs to retain
    } = req.body;

    const attachments = req.files || [];

    const productQuantity = Number(product_quantity);

    console.log("product_quantity: ", product_quantity);
    console.log("Attachment Ids to retain: ", attachments_id);

    if (
        !account_id ||
        !warehouse_id ||
        !product_id ||
        !sale_date ||
        !customer_name ||
        product_quantity == null ||
        total_sale == null ||
        !sale_payment_status ||
        total_delivery_quantity == null ||
        total_delivered == null ||
        !delivery_status
    ) {
        return res.status(400).json({ error: "Missing required information." });
    }

    const updateSalesQuery = `
    UPDATE sales 
    SET account_id = ?, warehouse_id = ?, sale_date = ?, customer_name = ?, 
        total_sale = ?, delivery_status = ?, sale_payment_status = ?, updated_at = NOW()
    WHERE sales_id = ?
  `;

    const updateSalesItemQuery = `
    UPDATE sales_item 
    SET product_id = ?, product_quantity = ?, updated_at = NOW()
    WHERE sales_id = ?
  `;

    const updateSalesDeliveriesQuery = `
    UPDATE sales_deliveries 
    SET total_delivery_quantity = ?, total_delivered = ?, updated_at = NOW()
    WHERE sales_item_id = ?
  `;

    const getExistingAttachmentsQuery = `
    SELECT attachment_id FROM sales_attachments WHERE sales_delivery_id = ?
  `;

    const deleteAttachmentsQuery = `
    DELETE FROM sales_attachments WHERE attachment_id IN (?)
  `;

    const insertAttachmentsQuery = `
    INSERT INTO sales_attachments (sales_delivery_id, file, file_name, uploaded_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW())
  `;

    // STEP 1: Update sales
    executeQueryWithCallback(
        updateSalesQuery,
        [
            account_id,
            warehouse_id,
            sale_date,
            customer_name,
            total_sale,
            delivery_status,
            sale_payment_status,
            salesId,
        ],
        (err) => {
            if (err) return res.status(500).json({ error: "Failed to update sales" });

            // STEP 2: Get sales_item_id
            const getSalesItemIdQuery = `SELECT sales_item_id FROM sales_item WHERE sales_id = ? LIMIT 1`;
            executeQueryWithCallback(getSalesItemIdQuery, [salesId], (err2, rows) => {
                if (err2 || !rows.length)
                    return res.status(500).json({ error: "Failed to fetch sales_item_id" });

                const salesItemId = rows[0].sales_item_id;

                // STEP 3: Update sales_item
                executeQueryWithCallback(updateSalesItemQuery, [product_id, productQuantity, salesId], (err3) => {
                    if (err3) return res.status(500).json({ error: "Failed to update sales item" });

                    // STEP 4: Update sales_deliveries
                    executeQueryWithCallback(
                        updateSalesDeliveriesQuery,
                        [total_delivery_quantity, total_delivered, salesItemId],
                        (err4) => {
                            if (err4) return res.status(500).json({ error: "Failed to update deliveries" });

                            // STEP 5: Get sales_delivery_id
                            const getDeliveryIdQuery = `
                SELECT sales_delivery_id FROM sales_deliveries WHERE sales_item_id = ? LIMIT 1
              `;
                            executeQueryWithCallback(getDeliveryIdQuery, [salesItemId], (err5, rows2) => {
                                if (err5 || !rows2.length)
                                    return res.status(500).json({ error: "Failed to fetch sales_delivery_id" });

                                const salesDeliveryId = rows2[0].sales_delivery_id;

                                // STEP 6: Handle attachments
                                executeQueryWithCallback(getExistingAttachmentsQuery, [salesDeliveryId], (err6, existingRows) => {
                                    if (err6) return res.status(500).json({ error: "Failed to fetch existing attachments" });

                                    const existingIds = existingRows.map(r => Number(r.attachment_id));

                                    let retainedIds = [];
                                    if (Array.isArray(attachments_id)) {
                                        retainedIds = attachments_id.map(id => Number(id));
                                    } else if (typeof attachments_id === "string") {
                                        retainedIds = attachments_id.split(",").map(id => Number(id.trim()));
                                    }

                                    const toDeleteIds = existingIds.filter(id => !retainedIds.includes(id));
                                    if (toDeleteIds.length > 0) {
                                        executeQueryWithCallback(deleteAttachmentsQuery, [toDeleteIds], (err7) => {
                                            if (err7) return res.status(500).json({ error: "Failed to delete removed attachments" });
                                            insertNewFiles();
                                        });
                                    } else {
                                        insertNewFiles();
                                    }

                                    function insertNewFiles() {
                                        if (!attachments.length) return res.json({ message: "Sales updated successfully" });

                                        const insertPromises = attachments.map(file => {
                                            return new Promise((resolve, reject) => {
                                                executeQueryWithCallback(
                                                    insertAttachmentsQuery,
                                                    [salesDeliveryId, file.buffer, file.originalname],
                                                    (err8) => {
                                                        if (err8) reject(err8);
                                                        else resolve();
                                                    }
                                                );
                                            });
                                        });

                                        Promise.all(insertPromises)
                                            .then(() => res.json({ message: "Sales updated successfully with attachments" }))
                                            .catch(() => res.status(500).json({ error: "Failed to insert new attachments" }));
                                    }
                                });


                            });
                        }
                    );
                });
            });
        }
    );
});



app.get("/sales", (req, res) => {
    db.query("SELECT * FROM sales", (err, sales) => {
        if (err) return res.status(500).json({ error: err });

        db.query("SELECT * FROM sales_item", (err, items) => {
            if (err) return res.status(500).json({ error: err });

            db.query("SELECT * FROM sales_deliveries", (err, deliveries) => {
                if (err) return res.status(500).json({ error: err });

                db.query("SELECT * FROM sales_attachments", (err, attachments) => {
                    if (err) return res.status(500).json({ error: err });

                    res.json({
                        sales,
                        items,
                        deliveries,
                        attachments
                    });
                });
            });
        });
    });
});

// DOCUMENTS
const MAX_FILE_BYTES = 500 * 1024; // 500KB
const ALLOWED_MIME = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.ms-excel",                                                // xls (older)
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // xlsx
]);
const ALLOWED_EXT = new Set([".pdf", ".docx", ".xls", ".xlsx"]);

const mimeToExt = (mime) => {
    const map = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    };
    return map[mime] || "";
};

const ensureExtension = (name, mime) => {
    const ext = path.extname(name || "");
    if (ext) return name;
    const guess = mimeToExt(mime);
    return guess ? `${name}.${guess}` : name;
};

const isAllowed = (file) => {
    const mimeOk = ALLOWED_MIME.has(file.mimetype);
    const ext = path.extname(file.originalname || "").toLowerCase();
    const extOk = ALLOWED_EXT.has(ext);
    return mimeOk && extOk;
};

// GET /documents?search=...
app.get("/documents", (req, res) => {
    const search = (req.query.search || "").trim();
    const like = `%${search}%`;
    const sql = `
    SELECT document_id, document_name, file_name, file_type,
           OCTET_LENGTH(file_data) AS file_size, uploaded_at
    FROM documents
    ${search ? "WHERE document_name LIKE ? OR file_name LIKE ? OR file_type LIKE ?" : ""}
    ORDER BY uploaded_at DESC, document_id DESC
  `;
    const params = search ? [like, like, like] : [];
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /documents (PDF/DOCX/XLS/XLSX only; 500KB limit)
app.post("/documents", upload.single("file"), (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file uploaded." });

        if (!isAllowed(file)) {
            return res.status(415).json({ error: "Only PDF, DOCX, XLS, and XLSX are allowed." });
        }
        if (file.size > MAX_FILE_BYTES) {
            return res.status(413).json({ error: "File too large. Max is 500KB." });
        }

        const file_type = file.mimetype || "application/octet-stream";
        const original = file.originalname || "file";
        const normalized = ensureExtension(original, file_type);

        const document_name = (req.body.document_name || normalized).trim();
        const file_name = normalized;
        const file_data = file.buffer;

        const sql = `INSERT INTO documents (document_name, file_name, file_data, file_type) VALUES (?,?,?,?)`;
        db.query(sql, [document_name, file_name, file_data, file_type], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Document uploaded", document_id: result.insertId, document_name, file_name, file_type });
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// PUT /documents/:id
app.put("/documents/:id", (req, res) => {
    const { id } = req.params;
    const { document_name } = req.body;
    if (!document_name || !document_name.trim())
        return res.status(400).json({ error: "document_name is required" });

    db.query("UPDATE documents SET document_name=? WHERE document_id=?", [document_name.trim(), id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Document updated" });
    });
});

// GET /documents/:id/view (inline)
app.get("/documents/:id/view", (req, res) => {
    const { id } = req.params;
    db.query("SELECT document_name, file_name, file_data, file_type FROM documents WHERE document_id=? LIMIT 1", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows || rows.length === 0) return res.status(404).json({ error: "Not found" });

        const { document_name, file_name, file_data, file_type } = rows[0];
        const ext = path.extname(file_name || "");
        const base = (document_name || file_name || "document").replace(/[\\/:*?"<>|]/g, "_").trim() || "document";
        const finalName = base.toLowerCase().endsWith(ext.toLowerCase()) ? base : base + ext;

        res.setHeader("Content-Type", file_type || "application/octet-stream");
        res.setHeader("Content-Disposition", `inline; filename="${finalName}"`);
        res.setHeader("Accept-Ranges", "bytes");
        res.status(200).send(file_data);
    });
});

// GET /documents/:id/inline (base64)
app.get("/documents/:id/inline", (req, res) => {
    const { id } = req.params;
    db.query("SELECT document_name, file_name, file_data, file_type FROM documents WHERE document_id=? LIMIT 1", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows || rows.length === 0) return res.status(404).json({ error: "Not found" });

        const { document_name, file_name, file_data, file_type } = rows[0];
        const base64 = Buffer.from(file_data).toString("base64");
        res.json({ document_name, file_name, file_type, base64 });
    });
});

// GET /documents/:id/download (attachment)
app.get("/documents/:id/download", (req, res) => {
    const { id } = req.params;
    db.query("SELECT document_name, file_name, file_data, file_type FROM documents WHERE document_id=? LIMIT 1", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows || rows.length === 0) return res.status(404).json({ error: "Not found" });

        const { document_name, file_name, file_data, file_type } = rows[0];
        const ext = path.extname(file_name || "");
        const base = (document_name || file_name || "download").replace(/[\\/:*?"<>|]/g, "_").trim() || "download";
        const finalName = base.toLowerCase().endsWith(ext.toLowerCase()) ? base : base + ext;

        res.setHeader("Content-Type", file_type || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${finalName}"`);
        res.status(200).send(file_data);
    });
});

// DELETE /documents/:id
app.delete("/documents/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM documents WHERE document_id=?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Document deleted" });
    });
});


// ===== helpers =====
function toInt(v) { const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : 0; }

function adjustProductStock({ product_id, delta }, cb) {
    const pid = toInt(product_id);
    const d = toInt(delta);
    if (!pid || d === 0) return cb?.(null);

    db.getConnection((err, conn) => {
        if (err) return cb?.(err);
        conn.beginTransaction(err => {
            if (err) { conn.release(); return cb?.(err); }

            conn.query('SELECT stock FROM products WHERE product_id=? FOR UPDATE', [pid], (e1, rows) => {
                if (e1) return conn.rollback(() => { conn.release(); cb?.(e1); });
                if (!rows?.length) return conn.rollback(() => { conn.release(); cb?.(new Error('Product not found')); });

                const current = toInt(rows[0].stock);
                const next = current + d;
                if (next < 0) return conn.rollback(() => { conn.release(); cb?.(new Error('Insufficient stock to apply this change')); });

                conn.query('UPDATE products SET stock=? WHERE product_id=?', [next, pid], e2 => {
                    if (e2) return conn.rollback(() => { conn.release(); cb?.(e2); });
                    const status = computeStockStatus(next); // you already have this function
                    conn.query('UPDATE products SET stock_status=? WHERE product_id=?', [status, pid], e3 => {
                        if (e3) return conn.rollback(() => { conn.release(); cb?.(e3); });
                        conn.commit(e4 => { conn.release(); cb?.(e4 || null); });
                    });
                });
            });
        });
    });
}

// ---- stock movement + warehouse helpers ----
function getSessionWarehouseId(req, cb) {
    const uid = req.session?.user?.account_id;
    if (!uid) return cb(null, null);
    db.query(
        'SELECT warehouse_id FROM accounts WHERE account_id=? LIMIT 1',
        [uid],
        (err, rows) => {
            if (err) return cb(err);
            cb(null, rows?.[0]?.warehouse_id || null);
        }
    );
}


// Get warehouse info (id + name) of the logged in account
function getWarehouseInfo(req, cb) {
    const uid = req.session?.user?.account_id;
    if (!uid) return cb(new Error('Not authenticated'));
    const sql = `
    SELECT a.warehouse_id, w.warehouse_name
    FROM accounts a
    LEFT JOIN warehouse w ON w.warehouse_id = a.warehouse_id
    WHERE a.account_id = ? LIMIT 1
  `;
    db.query(sql, [uid], (err, rows) => {
        if (err) return cb(err);
        if (!rows?.length) return cb(new Error('Warehouse not found for user'));
        cb(null, { warehouse_id: rows[0].warehouse_id, warehouse_name: rows[0].warehouse_name || 'Warehouse' });
    });
}

// Create a list of labels for the chart ranges
function makeLabels(mode) {
    const labels = [];
    const today = new Date();
    function fmtDate(d) { return d.toISOString().slice(0, 10); }          // YYYY-MM-DD
    function fmtMonth(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
    function fmtWeek(d) { // ISO week label e.g. 2025-W07
        const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Thursday in current week decides the year
        tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
        return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }

    if (mode === 'daily') {
        for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); labels.push(fmtDate(d)); }
    } else if (mode === 'weekly') {
        for (let i = 7; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i * 7); labels.push(fmtWeek(d)); }
    } else { // monthly
        for (let i = 11; i >= 0; i--) { const d = new Date(today); d.setMonth(today.getMonth() - i, 1); labels.push(fmtMonth(d)); }
    }
    return labels;
}



function resolveWarehouseForSalesReturn(req, sales_item_id, cb) {
    if (sales_item_id) {
        const sql = `
      SELECT s.warehouse_id
      FROM sales_item si
      JOIN sales s ON s.sales_id = si.sales_id
      WHERE si.sales_item_id = ? LIMIT 1
    `;
        db.query(sql, [toInt(sales_item_id)], (e, rows) => {
            if (e) return cb(e);
            if (rows?.length) return cb(null, rows[0].warehouse_id || null);
            getSessionWarehouseId(req, cb);
        });
    } else {
        getSessionWarehouseId(req, cb);
    }
}

// default to session warehouse
function resolveWarehouseForPurchaseReturn(req, purchase_item_id, cb) {
    getSessionWarehouseId(req, cb);
}

// Write an auditable 'ledger' line into stock_movements
function recordStockMovement(
    { product_id, warehouse_id = null, quantity, movement_type, sales_return_id = null, purchase_return_id = null },
    cb
) {
    const sql = `
    INSERT INTO stock_movements
      (product_id, warehouse_id, quantity, movement_type, sales_returns, purchase_returns)
    VALUES (?,?,?,?,?,?)
  `;
    const params = [
        toInt(product_id),
        warehouse_id,
        toInt(quantity),
        movement_type,
        sales_return_id ? toInt(sales_return_id) : null,
        purchase_return_id ? toInt(purchase_return_id) : null
    ];
    db.query(sql, params, (err) => cb?.(err || null));
}



// SALES RETURNS
app.get('/returns/sales', (req, res) => {
    const search = (req.query.search || '').trim();
    const like = `%${search}%`;
    const sql = `
    SELECT 
      sr.sales_return_id,
      sr.sale_return_date AS date,
      sr.product_id,
      p.product_name AS product,
      sr.quantity,
      sr.reason,
      sr.customer_name,
      sr.confirmed
    FROM sales_returns sr
    JOIN products p ON p.product_id = sr.product_id
    ${search ? `WHERE p.product_name LIKE ? OR sr.customer_name LIKE ? OR sr.reason LIKE ?` : ''}
    ORDER BY sr.sale_return_date DESC, sr.sales_return_id DESC
  `;
    const params = search ? [like, like, like] : [];
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/returns/sales', (req, res) => {
    const { sale_return_date, product_id, sales_item_id = null, quantity, reason, customer_name, confirmed = false } = req.body;
    const qty = toInt(quantity);
    if (!sale_return_date || !product_id || !qty || !reason || !customer_name) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const sql = `
    INSERT INTO sales_returns (sale_return_date, product_id, sales_item_id, quantity, reason, customer_name, confirmed)
    VALUES (?,?,?,?,?,?,?)
  `;
    const params = [sale_return_date, product_id, sales_item_id || null, qty, reason, customer_name, confirmed ? 1 : 0];

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const newId = result.insertId;

        if (!confirmed) {
            return res.json({ message: 'Sales return created (pending)', sales_return_id: newId });
        }

        // Pag na confirm: add stock and write a movement (+qty, type 'sales_return')
        resolveWarehouseForSalesReturn(req, sales_item_id, (eW, whId) => {
            if (eW) return res.status(500).json({ error: eW.message });

            adjustProductStock({ product_id, delta: +qty }, (e2) => {
                if (e2) return res.status(500).json({ error: e2.message });
                recordStockMovement({
                    product_id, warehouse_id: whId, quantity: +qty, movement_type: 'sales_return', sales_return_id: newId
                }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Sales return created (confirmed)', sales_return_id: newId }));
            });
        });
    });
});

app.put('/returns/sales/:id', (req, res) => {
    const { id } = req.params;
    const { sale_return_date, product_id, sales_item_id = null, quantity, reason, customer_name, confirmed } = req.body;
    const qty = toInt(quantity);

    db.query('SELECT product_id, quantity, confirmed FROM sales_returns WHERE sales_return_id=? LIMIT 1', [id], (e0, rows) => {
        if (e0) return res.status(500).json({ error: e0.message });
        if (!rows?.length) return res.status(404).json({ error: 'Return not found' });

        const prev = rows[0];

        const sql = `
      UPDATE sales_returns
      SET sale_return_date=?, product_id=?, sales_item_id=?, quantity=?, reason=?, customer_name=?, confirmed=?, updated_at=NOW()
      WHERE sales_return_id=?
    `;
        const params = [sale_return_date, product_id, sales_item_id || null, qty, reason, customer_name, confirmed ? 1 : 0, id];

        db.query(sql, params, (e1) => {
            if (e1) return res.status(500).json({ error: e1.message });

            resolveWarehouseForSalesReturn(req, sales_item_id, (eW, whId) => {
                if (eW) return res.status(500).json({ error: eW.message });

                // Handle stock + movement based on state changes
                if (prev.confirmed && confirmed) {
                    if (prev.product_id === Number(product_id)) {
                        const delta = qty - toInt(prev.quantity);  // +delta = increase, -delta = decrease
                        if (delta === 0) return res.json({ message: 'Sales return updated' });

                        adjustProductStock({ product_id, delta: +delta }, (e2) => {
                            if (e2) return res.status(500).json({ error: e2.message });
                            recordStockMovement({
                                product_id, warehouse_id: whId, quantity: +delta, movement_type: 'sales_return', sales_return_id: toInt(id)
                            }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Sales return updated' }));
                        });

                    } else {
                        adjustProductStock({ product_id: prev.product_id, delta: -toInt(prev.quantity) }, (e2) => {
                            if (e2) return res.status(500).json({ error: e2.message });
                            recordStockMovement({
                                product_id: prev.product_id, warehouse_id: whId, quantity: -toInt(prev.quantity), movement_type: 'sales_return', sales_return_id: toInt(id)
                            }, (e2b) => {
                                if (e2b) return res.status(500).json({ error: e2b.message });
                                adjustProductStock({ product_id, delta: +qty }, (e3) => {
                                    if (e3) return res.status(500).json({ error: e3.message });
                                    recordStockMovement({
                                        product_id, warehouse_id: whId, quantity: +qty, movement_type: 'sales_return', sales_return_id: toInt(id)
                                    }, (e4) => e4 ? res.status(500).json({ error: e4.message }) : res.json({ message: 'Sales return updated' }));
                                });
                            });
                        });
                    }

                } else if (!prev.confirmed && confirmed) {
                    // Newly confirmed => add stock and movement (+qty)
                    adjustProductStock({ product_id, delta: +qty }, (e2) => {
                        if (e2) return res.status(500).json({ error: e2.message });
                        recordStockMovement({
                            product_id, warehouse_id: whId, quantity: +qty, movement_type: 'sales_return', sales_return_id: toInt(id)
                        }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Sales return updated (now confirmed)' }));
                    });

                } else if (prev.confirmed && !confirmed) {
                    // Unconfirm => reverse previous addition (write -prev.qty)
                    adjustProductStock({ product_id: prev.product_id, delta: -toInt(prev.quantity) }, (e2) => {
                        if (e2) return res.status(500).json({ error: e2.message });
                        recordStockMovement({
                            product_id: prev.product_id, warehouse_id: whId, quantity: -toInt(prev.quantity), movement_type: 'sales_return', sales_return_id: toInt(id)
                        }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Sales return updated (now pending)' }));
                    });

                } else {
                    res.json({ message: 'Sales return updated' });
                }
            });
        });
    });
});

app.delete('/returns/sales/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT product_id, quantity, confirmed, sales_item_id FROM sales_returns WHERE sales_return_id=? LIMIT 1', [id], (e0, rows) => {
        if (e0) return res.status(500).json({ error: e0.message });
        if (!rows?.length) return res.status(404).json({ error: 'Not found' });

        const prev = rows[0];

        db.query('DELETE FROM sales_returns WHERE sales_return_id=?', [id], (e1) => {
            if (e1) return res.status(500).json({ error: e1.message });

            resolveWarehouseForSalesReturn(req, prev.sales_item_id, (eW, whId) => {
                if (eW) return res.status(500).json({ error: eW.message });

                if (prev.confirmed) {
                    adjustProductStock({ product_id: prev.product_id, delta: -toInt(prev.quantity) }, (e2) => {
                        if (e2) return res.status(500).json({ error: e2.message });
                        recordStockMovement({
                            product_id: prev.product_id, warehouse_id: whId, quantity: -toInt(prev.quantity), movement_type: 'sales_return', sales_return_id: toInt(id)
                        }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Sales return deleted (stock reversed)' }));
                    });
                } else {
                    res.json({ message: 'Sales return deleted' });
                }
            });
        });
    });
});


// PURCHASE RETURNS
app.get('/returns/purchase', (req, res) => {
    const search = (req.query.search || '').trim();
    const like = `%${search}%`;
    const sql = `
    SELECT 
      pr.purchase_return_id,
      pr.purchase_return_date AS date,
      pr.product_id,
      p.product_name AS product,
      pr.quantity,
      pr.reason,
      pr.supplier_id,
      s.supplier_name,
      pr.confirmed
    FROM purchase_returns pr
    JOIN products  p ON p.product_id   = pr.product_id
    LEFT JOIN suppliers s ON s.supplier_id  = pr.supplier_id
    ${search ? `WHERE p.product_name LIKE ? OR s.supplier_name LIKE ? OR pr.reason LIKE ?` : ''}
    ORDER BY pr.purchase_return_date DESC, pr.purchase_return_id DESC
  `;
    const params = search ? [like, like, like] : [];
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/returns/purchase', (req, res) => {
    const { purchase_return_date, product_id, purchase_item_id = null, quantity, reason, supplier_id, confirmed = false } = req.body;
    const qty = toInt(quantity);
    if (!purchase_return_date || !product_id || !qty || !reason || !supplier_id) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const sql = `
    INSERT INTO purchase_returns (purchase_return_date, product_id, purchase_item_id, quantity, reason, supplier_id, confirmed)
    VALUES (?,?,?,?,?,?,?)
  `;
    const params = [purchase_return_date, product_id, purchase_item_id || null, qty, reason, supplier_id, confirmed ? 1 : 0];

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const newId = result.insertId;

        if (!confirmed) {
            return res.json({ message: 'Purchase return created (pending)', purchase_return_id: newId });
        }

        // If conirmed na: subtract stock and write movement (-qty, type 'purchase_return')
        resolveWarehouseForPurchaseReturn(req, purchase_item_id, (eW, whId) => {
            if (eW) return res.status(500).json({ error: eW.message });

            adjustProductStock({ product_id, delta: -qty }, (e2) => {
                if (e2) return res.status(500).json({ error: e2.message });
                recordStockMovement({
                    product_id, warehouse_id: whId, quantity: -qty, movement_type: 'purchase_return', purchase_return_id: newId
                }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Purchase return created (confirmed)', purchase_return_id: newId }));
            });
        });
    });
});

app.put('/returns/purchase/:id', (req, res) => {
    const { id } = req.params;
    const { purchase_return_date, product_id, purchase_item_id = null, quantity, reason, supplier_id, confirmed } = req.body;
    const qty = toInt(quantity);

    db.query('SELECT product_id, quantity, confirmed FROM purchase_returns WHERE purchase_return_id=? LIMIT 1', [id], (e0, rows) => {
        if (e0) return res.status(500).json({ error: e0.message });
        if (!rows?.length) return res.status(404).json({ error: 'Return not found' });

        const prev = rows[0];

        const sql = `
      UPDATE purchase_returns
      SET purchase_return_date=?, product_id=?, purchase_item_id=?, quantity=?, reason=?, supplier_id=?, confirmed=?, updated_at=NOW()
      WHERE purchase_return_id=?
    `;
        const params = [purchase_return_date, product_id, purchase_item_id || null, qty, reason, supplier_id, confirmed ? 1 : 0, id];

        db.query(sql, params, (e1) => {
            if (e1) return res.status(500).json({ error: e1.message });

            resolveWarehouseForPurchaseReturn(req, purchase_item_id, (eW, whId) => {
                if (eW) return res.status(500).json({ error: eW.message });

                if (prev.confirmed && confirmed) {
                    if (prev.product_id === Number(product_id)) {
                        // When confirmed, purchase return is a negative movement.
                        const delta = -(qty - toInt(prev.quantity)); // e.g. qty 5->7 => delta = -2
                        if (delta === 0) return res.json({ message: 'Purchase return updated' });

                        adjustProductStock({ product_id, delta }, (e2) => {
                            if (e2) return res.status(500).json({ error: e2.message });
                            recordStockMovement({
                                product_id, warehouse_id: whId, quantity: delta, movement_type: 'purchase_return', purchase_return_id: toInt(id)
                            }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Purchase return updated' }));
                        });

                    } else {
                        adjustProductStock({ product_id: prev.product_id, delta: +toInt(prev.quantity) }, (e2) => {
                            if (e2) return res.status(500).json({ error: e2.message });
                            recordStockMovement({
                                product_id: prev.product_id, warehouse_id: whId, quantity: +toInt(prev.quantity), movement_type: 'purchase_return', purchase_return_id: toInt(id)
                            }, (e2b) => {
                                if (e2b) return res.status(500).json({ error: e2b.message });
                                adjustProductStock({ product_id, delta: -qty }, (e3) => {
                                    if (e3) return res.status(500).json({ error: e3.message });
                                    recordStockMovement({
                                        product_id, warehouse_id: whId, quantity: -qty, movement_type: 'purchase_return', purchase_return_id: toInt(id)
                                    }, (e4) => e4 ? res.status(500).json({ error: e4.message }) : res.json({ message: 'Purchase return updated' }));
                                });
                            });
                        });
                    }

                } else if (!prev.confirmed && confirmed) {
                    // Newly confirmed => subtract stock and write movement (-qty)
                    adjustProductStock({ product_id, delta: -qty }, (e2) => {
                        if (e2) return res.status(500).json({ error: e2.message });
                        recordStockMovement({
                            product_id, warehouse_id: whId, quantity: -qty, movement_type: 'purchase_return', purchase_return_id: toInt(id)
                        }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Purchase return updated (now confirmed)' }));
                    });

                } else if (prev.confirmed && !confirmed) {
                    // Unconfirm => add back (+prev.qty) and write reversing movement (+prev.qty)
                    adjustProductStock({ product_id: prev.product_id, delta: +toInt(prev.quantity) }, (e2) => {
                        if (e2) return res.status(500).json({ error: e2.message });
                        recordStockMovement({
                            product_id: prev.product_id, warehouse_id: whId, quantity: +toInt(prev.quantity), movement_type: 'purchase_return', purchase_return_id: toInt(id)
                        }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Purchase return updated (now pending)' }));
                    });

                } else {
                    res.json({ message: 'Purchase return updated' });
                }
            });
        });
    });
});

app.delete('/returns/purchase/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT product_id, quantity, confirmed, purchase_item_id FROM purchase_returns WHERE purchase_return_id=? LIMIT 1', [id], (e0, rows) => {
        if (e0) return res.status(500).json({ error: e0.message });
        if (!rows?.length) return res.status(404).json({ error: 'Not found' });

        const prev = rows[0];

        db.query('DELETE FROM purchase_returns WHERE purchase_return_id=?', [id], (e1) => {
            if (e1) return res.status(500).json({ error: e1.message });

            resolveWarehouseForPurchaseReturn(req, prev.purchase_item_id, (eW, whId) => {
                if (eW) return res.status(500).json({ error: eW.message });

                if (prev.confirmed) {
                    adjustProductStock({ product_id: prev.product_id, delta: +toInt(prev.quantity) }, (e2) => {
                        if (e2) return res.status(500).json({ error: e2.message });
                        recordStockMovement({
                            product_id: prev.product_id, warehouse_id: whId, quantity: +toInt(prev.quantity), movement_type: 'purchase_return', purchase_return_id: toInt(id)
                        }, (e3) => e3 ? res.status(500).json({ error: e3.message }) : res.json({ message: 'Purchase return deleted (stock reversed)' }));
                    });
                } else {
                    res.json({ message: 'Purchase return deleted' });
                }
            });
        });
    });
});


// ----- DASHBOARD SUMMARY: totals + warehouse name -----
// ----- DASHBOARD SUMMARY: totals + warehouse name (REPLACE THIS BLOCK) -----
app.get('/dashboard/summary', (req, res) => {
  getWarehouseInfo(req, (e, wh) => {
    if (e) return res.status(401).json({ error: 'Not authenticated' });

    const wid = wh.warehouse_id;

    // Now both Sales and Purchases are filtered by warehouse_id
    const qSales     = 'SELECT COALESCE(SUM(total_sale),0) AS total FROM sales     WHERE warehouse_id=?';
    const qPurchases = 'SELECT COALESCE(SUM(total_cost),0) AS total FROM purchases WHERE warehouse_id=?';
    const qProducts  = 'SELECT COUNT(*) AS cnt FROM products';

    db.query(qSales, [wid], (e1, r1) => {
      if (e1) return res.status(500).json({ error: e1.message });
      db.query(qPurchases, [wid], (e2, r2) => {                       // <-- fixed: pass [wid]
        if (e2) return res.status(500).json({ error: e2.message });
        db.query(qProducts, [], (e3, r3) => {
          if (e3) return res.status(500).json({ error: e3.message });
          res.json({
            warehouse: wh,
            totals: {
              sales: Number(r1?.[0]?.total || 0),
              purchases: Number(r2?.[0]?.total || 0),
              products: Number(r3?.[0]?.cnt || 0)
            }
          });
        });
      });
    });
  });
});


// ----- DASHBOARD SERIES: sales vs purchases daily/weekly/monthly (REPLACE THIS BLOCK) -----
app.get('/dashboard/series', (req, res) => {
  const mode = String(req.query.mode || 'weekly').toLowerCase(); // daily | weekly | monthly
  if (!['daily', 'weekly', 'monthly'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  getWarehouseInfo(req, (e, wh) => {
    if (e) return res.status(401).json({ error: 'Not authenticated' });

    let salesSQL, purchasesSQL, paramsSales = [], paramsPurch = [];

    if (mode === 'daily') {
      // Last 7 days (today minus 6 days…today), labeled as YYYY-MM-DD
      salesSQL = `
        SELECT DATE(sale_date) AS label, COALESCE(SUM(total_sale),0) AS total
        FROM sales
        WHERE warehouse_id=? AND sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(sale_date)
      `;
      purchasesSQL = `
        SELECT DATE(purchase_date) AS label, COALESCE(SUM(total_cost),0) AS total
        FROM purchases
        WHERE warehouse_id=? AND purchase_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(purchase_date)
      `;
      paramsSales = [wh.warehouse_id];
      paramsPurch = [wh.warehouse_id];

    } else if (mode === 'weekly') {
      // Last 8 ISO weeks, labeled as YYYY-Www (e.g., 2025-W07)
      salesSQL = `
        SELECT CONCAT(YEARWEEK(sale_date,1)) AS raw, COALESCE(SUM(total_sale),0) AS total
        FROM sales
        WHERE warehouse_id=? AND sale_date >= DATE_SUB(CURDATE(), INTERVAL 56 DAY)
        GROUP BY YEARWEEK(sale_date,1)
      `;
      purchasesSQL = `
        SELECT CONCAT(YEARWEEK(purchase_date,1)) AS raw, COALESCE(SUM(total_cost),0) AS total
        FROM purchases
        WHERE warehouse_id=? AND purchase_date >= DATE_SUB(CURDATE(), INTERVAL 56 DAY)
        GROUP BY YEARWEEK(purchase_date,1)
      `;
      paramsSales = [wh.warehouse_id];
      paramsPurch = [wh.warehouse_id];

    } else {
      // monthly: last 12 months, labeled as YYYY-MM
      salesSQL = `
        SELECT DATE_FORMAT(sale_date,'%Y-%m') AS label, COALESCE(SUM(total_sale),0) AS total
        FROM sales
        WHERE warehouse_id=? AND sale_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
        GROUP BY DATE_FORMAT(sale_date,'%Y-%m')
      `;
      purchasesSQL = `
        SELECT DATE_FORMAT(purchase_date,'%Y-%m') AS label, COALESCE(SUM(total_cost),0) AS total
        FROM purchases
        WHERE warehouse_id=? AND purchase_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
        GROUP BY DATE_FORMAT(purchase_date,'%Y-%m')
      `;
      paramsSales = [wh.warehouse_id];
      paramsPurch = [wh.warehouse_id];
    }

    db.query(salesSQL, paramsSales, (e1, rs) => {
      if (e1) return res.status(500).json({ error: e1.message });
      db.query(purchasesSQL, paramsPurch, (e2, rp) => {
        if (e2) return res.status(500).json({ error: e2.message });

        // Labels come from your makeLabels(mode) helper
        const labels = makeLabels(mode);

        // Map DB rows to label => total
        const mapSales = new Map();
        const mapPurch = new Map();

        if (mode === 'weekly') {
          // Convert YEARWEEK (e.g., 202540) -> '2025-W40'
          const toW = (raw) => {
            const s = String(raw);
            const year = s.slice(0, 4);
            const wk = s.slice(4);
            return `${year}-W${wk.padStart(2, '0')}`;
          };
          (rs || []).forEach(r => mapSales.set(toW(r.raw), Number(r.total || 0)));
          (rp || []).forEach(r => mapPurch.set(toW(r.raw), Number(r.total || 0)));
        } else {
          (rs || []).forEach(r => mapSales.set(r.label, Number(r.total || 0)));
          (rp || []).forEach(r => mapPurch.set(r.label, Number(r.total || 0)));
        }

        const sales = labels.map(l => mapSales.get(l) || 0);
        const purchases = labels.map(l => mapPurch.get(l) || 0);

        res.json({ mode, labels, sales, purchases });
      });
    });
  });
});


// ----- OUTSTANDING DELIVERIES (table) -----
app.get('/dashboard/outstanding-deliveries', (req, res) => {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 10)));
    getWarehouseInfo(req, (e, wh) => {
        if (e) return res.status(401).json({ error: 'Not authenticated' });

        const sql = `
      SELECT 
        s.sales_id,
        s.sale_date,
        s.customer_name,
        p.product_name,
        si.product_id,
        si.product_quantity,
        sd.total_delivery_quantity,
        sd.total_delivered,
        (sd.total_delivery_quantity - sd.total_delivered) AS remaining
      FROM sales s
      JOIN sales_item si       ON si.sales_id = s.sales_id
      JOIN products p          ON p.product_id = si.product_id
      LEFT JOIN sales_deliveries sd ON sd.sales_item_id = si.sales_item_id
      WHERE s.warehouse_id = ?
        AND sd.total_delivered < sd.total_delivery_quantity
      ORDER BY remaining DESC, s.sale_date ASC
      LIMIT ?
    `;
        db.query(sql, [wh.warehouse_id, limit], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    });
});





app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

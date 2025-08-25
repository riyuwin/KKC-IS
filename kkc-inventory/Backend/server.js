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

const db = mysql.createPool({
    host: process.env.VITE_DB_HOST,
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    database: process.env.VITE_DB_NAME,
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

app.get("/accounts_id", (req, res) => {
    const { accountId } = req.query;  

    if (!accountId) {
        return res.status(400).json({ error: "accountId is required" });
    }

    // Use parameterized query to prevent SQL injection
    const query = "SELECT * FROM basic_information WHERE account_id = ?";
    db.query(query, [accountId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);  
    });
});
 
app.get("/accounts", (req, res) => {
    db.query("SELECT * FROM accounts", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.get("/basic_information", (req, res) => {
    db.query("SELECT * FROM basic_information", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
}); 

app.post("/create_account", (req, res) => {
    const { warehouse_id, fullname, username, email, password, role } = req.body;

    // Check if the email already exists
    db.query("SELECT * FROM accounts WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("Email Check Error:", err);
            return res.status(500).json({ error: "Internal server error." });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Email is already taken." });
        }

        // Hash password
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

            db.getConnection((err, connection) => {
                if (err) {
                    console.error("Connection Error:", err);
                    return res.status(500).json({ error: err.message });
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        console.error("Transaction Error:", err);
                        connection.release();
                        return res.status(500).json({ error: err.message });
                    }

                    connection.query(
                        insertAccountQuery,
                        [warehouse_id, fullname, username, email, hashedPassword, role],
                        (err, result) => {
                            if (err) {
                                console.error("Account Insertion Error:", err);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: err.message });
                                });
                            }
 
                            connection.commit((err) => {
                                if (err) {
                                    console.error("Commit Error:", err);
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: err.message });
                                    });
                                }

                                connection.release();
                                res.json({ 
                                    message: "Account created successfully", 
                                    id: result.insertId 
                                });
                            });
                        }
                    );
                });
            });
        });
    });
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

            req.session.user = { account_id: user.account_id, email: user.email,  user_level: user.user_level };
            console.log("Session Created:", req.session.user);

            res.json({ message: "Login successful", account_id: user.account_id, email: user.email, user_level: user.user_level });
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
 
app.post("/insert_warehouse", (req, res) => { 
    const { warehouseName, warehouseLocation } = req.body;

    const insertWarehouseQuery = `
        INSERT INTO warehouse (warehouse_name, location, added_at) 
        VALUES (?, ?, NOW())
    `;

    db.getConnection((err, connection) => {
        if (err) {
            console.error("Connection Error:", err);
            return res.status(500).json({ error: err.message });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error("Transaction Error:", err);
                return connection.rollback(() => {
                    res.status(500).json({ error: err.message });
                });
            }

            connection.query(
                insertWarehouseQuery,
                [warehouseName, warehouseLocation],
                (err, result) => {
                    if (err) {
                        console.error("Warehouse Insertion Error:", err);
                        return connection.rollback(() => {
                            res.status(500).json({ error: err.message });
                        });
                    }

                    // Commit the transaction
                    connection.commit((err) => {
                        if (err) {
                            console.error("Commit Error:", err);
                            return connection.rollback(() => {
                                res.status(500).json({ error: err.message });
                            });
                        }

                        res.json({ message: "Warehouse added successfully", id: result.insertId });
                    });
                }
            );
        });
    });
});

app.get("/retrieve_warehouse", (req, res) => {
    db.query("SELECT * FROM warehouse", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
}); 

app.get("/retrieve_accounts", (req, res) => {
    db.query("SELECT * FROM accounts", (err, results) => {
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





app.listen(process.env.VITE_PORT, () => console.log(`Server running on port ${process.env.VITE_PORT}`));

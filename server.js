const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ serve images folder
app.use("/images", express.static(path.join(__dirname, "images")));


const users = [
  { email: "admin@example.com", password: "password123" },
  { email: "user@example.com", password: "userpass" }
];


let formData = [];


let jewelleryProducts = [
  {
    id: 1,
    name: "Multiple Jewellery",
    price: "₹15,000",
    image: "http://127.0.0.1:5000/images/Multiple-jewellery.jpg",
  },
  {
    id: 2,
    name: "Diamond Ring",
    price: "₹25,000",
    image: "http://127.0.0.1:5000/images/Multiple-jewellery.jpg",
  },
];


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", email, password);

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required",
    });
  }

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    return res.json({
      success: true,
      message: "Login successful",
      user: { email: user.email },
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid login credentials",
  });
});


app.post("/submit", (req, res) => {
  const { name, email, contact, message } = req.body;

  if (!name || !email || !contact || !message) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  const newEntry = {
    id: formData.length + 1,
    name,
    email,
    contact,
    message,
  };

  formData.push(newEntry);

  res.status(201).json({
    message: "Form submitted successfully!",
    data: newEntry,
  });
});


app.get("/data", (req, res) => {
  res.json(formData);
});


app.put("/update/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, contact, message } = req.body;

  formData = formData.map((item) =>
    item.id === id
      ? { ...item, name, email, contact, message }
      : item
  );

  res.json({ message: `Data with ID ${id} updated successfully.` });
});


app.delete("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  formData = formData.filter((item) => item.id !== id);

  res.json({ message: `Data with ID ${id} deleted successfully.` });
});


app.get("/jewellery", (req, res) => {
  res.json(jewelleryProducts);
});


app.post("/jewellery", (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newProduct = {
    id: jewelleryProducts.length + 1,
    name,
    price,
    image,
  };

  jewelleryProducts.push(newProduct);

  res.status(201).json({
    message: "Product added",
    data: newProduct,
  });
});


app.put("/jewellery/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, image } = req.body;

  const product = jewelleryProducts.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.name = name || product.name;
  product.price = price || product.price;
  product.image = image || product.image;

  res.json({ message: "Product updated", data: product });
});


app.delete("/jewellery/:id", (req, res) => {
  const id = parseInt(req.params.id);
  jewelleryProducts = jewelleryProducts.filter((p) => p.id !== id);

  res.json({ message: "Product deleted successfully" });
});


app.get("/table", (req, res) => {
  const rows = formData
    .map(
      (item) => `
<tr>
<td>${item.id}</td>
<td>${item.name}</td>
<td>${item.email}</td>
<td>${item.contact}</td>
<td>${item.message}</td>
<td>
<button onclick="deleteRow(${item.id})" style="background:red;color:white;">
Delete
</button>
<button onclick="updateRow(${item.id})" style="background:blue;color:white;">
Update
</button>
</td>
</tr>
`
    )
    .join("");

  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Contact Table</title>
</head>
<body>
<h2>Contact Data</h2>

<table border="1" cellpadding="10">
<tr>
<th>ID</th>
<th>Name</th>
<th>Email</th>
<th>Contact</th>
<th>Message</th>
<th>Action</th>
</tr>
${rows}
</table>

<script>
async function deleteRow(id) {
  if (!confirm("Delete this record?")) return;

  await fetch('/delete/' + id, {
    method: 'DELETE'
  });

  location.reload();
}

async function updateRow(id) {
  const name = prompt("Enter name:");
  const email = prompt("Enter email:");
  const contact = prompt("Enter contact:");
  const message = prompt("Enter message:");

  await fetch('/update/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, contact, message })
  });

  location.reload();
}
</script>

</body>
</html>
`);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
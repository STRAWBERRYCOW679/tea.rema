import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const server = express();
const port = 5000;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const accountsFile = path.join(projectRoot, "accounts.json");
const sessionsFile = path.join(projectRoot, "sessions.json");
const orders = [];
const accounts = new Map();
const sessions = new Map();

function loadAccounts() {
    if (!fs.existsSync(accountsFile)) return;
    const savedAccounts = JSON.parse(fs.readFileSync(accountsFile, "utf8"));
    for (const account of savedAccounts) accounts.set(account.email, account);
}

function saveAccounts() {
    fs.writeFileSync(accountsFile, JSON.stringify([...accounts.values()], null, 2));
}

function loadSessions() {
    if (!fs.existsSync(sessionsFile)) return;
    const savedSessions = JSON.parse(fs.readFileSync(sessionsFile, "utf8"));
    for (const [token, user] of savedSessions) sessions.set(token, user);
}

function saveSessions() {
    fs.writeFileSync(sessionsFile, JSON.stringify([...sessions.entries()], null, 2));
}

loadAccounts();
loadSessions();

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

server.use(express.json({ limit: "2mb" }));
server.get("/additional stuff/index.html", function (req, res) {
    return res.redirect(301, "/index.html");
});
server.use(express.static(projectRoot));

server.get("/", function (req, res) {
    res.sendFile(path.join(projectRoot, "index.html"));
});

server.post("/orders", function (req, res) {
    const { name, price, description, quantity = 1 } = req.body;

    if (!name || !price || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "A name, price, and valid quantity are required." });
    }

    const existingOrder = orders.find((order) => order.name === name);

    if (existingOrder) {
        existingOrder.quantity += quantity;
    } else {
        orders.push({ name, price, description: description || "", quantity });
    }

    return res.status(201).json({ orders });
});

server.get("/orders", function (req, res) {
    res.json({ orders });
});

server.get("/cart", function (req, res) {
    res.json({ orders });
});

function validateCredentials(email, password) {
    return email.includes("@") && email.includes(".") && password.length >= 6;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
    const hash = scryptSync(password, salt, 64).toString("hex");
    return { salt, hash };
}

function passwordMatches(password, account) {
    const hash = scryptSync(password, account.salt, 64);
    return timingSafeEqual(hash, Buffer.from(account.hash, "hex"));
}

function createSession(user) {
    const token = randomUUID();
    sessions.set(token, user);
    saveSessions();
    return token;
}

server.post("/register", function (req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const name = email.split("@")[0];

    if (!validateCredentials(email, password)) {
        return res.status(400).json({ error: "Enter a valid email and a password of at least 6 characters." });
    }

    if (accounts.has(email)) {
        return res.status(409).json({ error: "An account with that email already exists. Log in instead." });
    }

    const account = { name, email, profilePic: "", ...hashPassword(password) };
    accounts.set(email, account);
    saveAccounts();
    const user = { name, email, profilePic: account.profilePic };
    return res.status(201).json({ token: createSession(user), user });
});

server.post("/login", function (req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!validateCredentials(email, password)) {
        return res.status(400).json({ error: "Enter a valid email and a password of at least 6 characters." });
    }

    const account = accounts.get(email);

    if (!account || !passwordMatches(password, account)) {
        return res.status(401).json({ error: "Email or password is incorrect." });
    }

    const user = { name: account.name, email: account.email, profilePic: account.profilePic || "" };
    return res.json({ token: createSession(user), user });
});

server.get("/profile", function (req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const user = sessions.get(token);

    if (!user) {
        return res.status(401).json({ error: "Please log in to view your profile." });
    }

    return res.json({ user });
});

server.put("/profile", function (req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const sessionUser = sessions.get(token);
    if (!sessionUser) {
        return res.status(401).json({ error: "Please log in to update your profile." });
    }

    const account = accounts.get(sessionUser.email);
    const profilePic = String(req.body.profilePic || "");
    if (!account || (profilePic && !profilePic.startsWith("data:image/"))) {
        return res.status(400).json({ error: "Please choose a valid profile image." });
    }

    account.profilePic = profilePic;
    sessionUser.profilePic = profilePic;
    saveAccounts();
    return res.json({ user: sessionUser });
});

server.post("/logout", function (req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    sessions.delete(token);
    saveSessions();
    return res.status(204).end();
});

server.listen(port, "0.0.0.0", function () {
    console.log(`Server is running on port ${port}`);
});

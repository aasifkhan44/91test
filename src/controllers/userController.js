import connection from "../config/connectDB";
require('dotenv').config();

// Game routes controllers
const aviator = async (req, res) => {
    return res.render("bet/aviator/aviator.ejs");
};

const popular = async (req, res) => {
    return res.render("bet/popular/popular.ejs");
};

const lottery = async (req, res) => {
    return res.render("bet/lottery/lottery.ejs");
};

const slots = async (req, res) => {
    return res.render("bet/slots/slots.ejs");
};

export default {
    aviator,
    popular,
    lottery,
    slots
};
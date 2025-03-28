import connection from '../config/connectDB';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import moment from 'moment';

const winGoPage = async(req, res) => {
    return res.render("bet/wingo/win.ejs");
}

const winGoPage3 = async(req, res) => {
    return res.render("bet/wingo/win3.ejs");
}

const winGoPage5 = async(req, res) => {
    return res.render("bet/wingo/win5.ejs");
}

const winGoPage10 = async(req, res) => {
    return res.render("bet/wingo/win10.ejs");
}

const addWinGo = async(game) => {
    try {
        let gameType = "wingo";
        if (game == 3) gameType = "wingo3";
        if (game == 5) gameType = "wingo5";
        if (game == 10) gameType = "wingo10";

        const [rows] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = ? ORDER BY `id` DESC LIMIT 1 ', [gameType]);
        const [setting] = await connection.execute('SELECT * FROM `admin` ');
        const timeCurrent = Date.now();
        const nextResult = parseInt(setting[0][gameType]);

        if (rows.length > 0) {
            let period = parseInt(rows[0].period) + 1;
            if (nextResult == -1) {
                // Random result
                const randomResult = Math.floor(Math.random() * 10);
                const sql = "INSERT INTO wingo SET period = ?, result = ?, game = ?, status = ?, time = ?";
                await connection.execute(sql, [period, randomResult, gameType, 0, timeCurrent]);
            } else {
                // Fixed result from admin setting
                const sql = "INSERT INTO wingo SET period = ?, result = ?, game = ?, status = ?, time = ?";
                await connection.execute(sql, [period, nextResult, gameType, 0, timeCurrent]);
            }
        }
    } catch (error) {
        console.log('Error adding WinGo record:', error);
    }
}

const handlingWinGo1P = async(game) => {
    try {
        let gameType = "wingo";
        if (game == 3) gameType = "wingo3";
        if (game == 5) gameType = "wingo5";
        if (game == 10) gameType = "wingo10";

        const [rows] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = ? AND `status` = 0 ORDER BY `id` DESC LIMIT 1 ', [gameType]);
        if (rows.length > 0) {
            const [orders] = await connection.execute('SELECT * FROM `wingo_order` WHERE `status` = ? AND `game` = ? ', [0, gameType]);
            const period = rows[0].period;
            const result = rows[0].result;

            // Process all pending orders for this game period
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                if (order.period == period) {
                    let status = "lose";
                    let receive = 0;

                    // Determine win/lose based on bet type and result
                    if (order.bet == 'up' && (result >= 5 && result <= 9)) {
                        status = "win";
                        receive = order.money * 2;
                    } else if (order.bet == 'down' && (result >= 0 && result <= 4)) {
                        status = "win";
                        receive = order.money * 2;
                    } else if (order.bet == 'violet' && (result == 0 || result == 5)) {
                        status = "win";
                        receive = order.money * 4.5;
                    } else if (order.bet == 'red' && (result == 1 || result == 3 || result == 7 || result == 9)) {
                        status = "win";
                        receive = order.money * 2;
                    } else if (order.bet == 'green' && (result == 2 || result == 4 || result == 6 || result == 8)) {
                        status = "win";
                        receive = order.money * 2;
                    } else if (order.bet == order.result) {
                        status = "win";
                        receive = order.money * 9;
                    }

                    // Update order status
                    await connection.execute('UPDATE `wingo_order` SET `status` = ?, `receive` = ? WHERE `id` = ? ', [status, receive, order.id]);

                    // Update user balance if they won
                    if (status == "win") {
                        await connection.execute('UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ? ', [receive, order.phone]);
                    }
                }
            }

            // Mark this game period as processed
            await connection.execute('UPDATE `wingo` SET `status` = ? WHERE `id` = ? ', [1, rows[0].id]);
        }
    } catch (error) {
        console.log('Error handling WinGo results:', error);
    }
}

const betWinGo = async(req, res) => {
    try {
        const { gameJoin, typeid, join, money } = req.body;
        const phone = req.cookies.phone;
        const time = new Date().getTime();

        let typeGame = "wingo";
        if (gameJoin == 3) typeGame = "wingo3";
        if (gameJoin == 5) typeGame = "wingo5";
        if (gameJoin == 10) typeGame = "wingo10";

        const [user] = await connection.execute('SELECT `money` FROM `users` WHERE `phone` = ? ', [phone]);
        const [period] = await connection.execute('SELECT `period` FROM `wingo` WHERE `game` = ? ORDER BY `id` DESC LIMIT 1 ', [typeGame]);

        if (user.length == 0) {
            return res.status(200).json({
                message: "User not found",
                status: false
            });
        }

        const userMoney = user[0].money;
        if (userMoney < money) {
            return res.status(200).json({
                message: "Insufficient balance",
                status: false
            });
        }

        // Deduct money from user's account
        await connection.execute('UPDATE `users` SET `money` = `money` - ? WHERE `phone` = ? ', [money, phone]);

        // Create bet order
        const sql = "INSERT INTO wingo_order SET phone = ?, period = ?, money = ?, game = ?, bet = ?, time = ?, status = ?";
        await connection.execute(sql, [phone, period[0].period, money, typeGame, join, time, 0]);

        return res.status(200).json({
            message: "Bet placed successfully",
            status: true,
            data: {
                money: userMoney - money
            }
        });
    } catch (error) {
        console.log('Error placing bet:', error);
        return res.status(500).json({
            message: "Server error",
            status: false
        });
    }
}

const listOrderOld = async(req, res) => {
    try {
        const { gameJoin, pageno, pageto } = req.body;
        const phone = req.cookies.phone;

        let typeGame = "wingo";
        if (gameJoin == 3) typeGame = "wingo3";
        if (gameJoin == 5) typeGame = "wingo5";
        if (gameJoin == 10) typeGame = "wingo10";

        const [rows] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = ? ORDER BY `id` DESC LIMIT ?, ? ', [typeGame, parseInt(pageno), parseInt(pageto)]);

        return res.status(200).json({
            message: "Success",
            status: true,
            datas: rows,
            page: 1,
            total: 1,
            pagesize: 10
        });
    } catch (error) {
        console.log('Error fetching order list:', error);
        return res.status(500).json({
            message: "Server error",
            status: false
        });
    }
}

const GetMyEmerdList = async(req, res) => {
    try {
        const { gameJoin, pageno, pageto } = req.body;
        const phone = req.cookies.phone;

        let typeGame = "wingo";
        if (gameJoin == 3) typeGame = "wingo3";
        if (gameJoin == 5) typeGame = "wingo5";
        if (gameJoin == 10) typeGame = "wingo10";

        const [rows] = await connection.execute('SELECT * FROM `wingo_order` WHERE `phone` = ? AND `game` = ? ORDER BY `id` DESC LIMIT ?, ? ', 
            [phone, typeGame, parseInt(pageno), parseInt(pageto)]);

        return res.status(200).json({
            message: "Success",
            status: true,
            datas: rows,
            page: 1,
            total: 1,
            pagesize: 10
        });
    } catch (error) {
        console.log('Error fetching user orders:', error);
        return res.status(500).json({
            message: "Server error",
            status: false
        });
    }
}

module.exports = {
    winGoPage,
    winGoPage3,
    winGoPage5,
    winGoPage10,
    addWinGo,
    handlingWinGo1P,
    betWinGo,
    listOrderOld,
    GetMyEmerdList
};
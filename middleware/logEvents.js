const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const logMake = async (name, message) => {
    const date = `${format(new Date(), 'yyyy/MM/dd\tHH:mm:ss')}`;
    const messageLog = `${date}, User: ${name.username} Event: ${message}\n`;
    try{
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', 'messageLog.txt'), messageLog);

        return true;
    } catch (err) {
        console.error(err);
    } 
}

const errorLog = async (errorMessage) => {
    const date = `${format(new Date(), 'yyyy/MM/dd\tHH::mm:ss')}`;
    const errorLog = `${date}   ${errorMessage}`;
    try {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', 'errorLogs.txt'), errorLog);

        return true;
        
    } catch (err) {
        console.error(err);     
    }
}

module.exports = { logMake, errorLog };
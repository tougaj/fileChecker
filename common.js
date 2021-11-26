const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const chalk = require('chalk');

const DATA_PATH = './data';
const fileListFileName = path.resolve(DATA_PATH, 'filesForCheck.txt');
const checksumFileName = path.resolve(DATA_PATH, 'checksum.txt');

/**
 * Загружает список файлов, для которых будут считаться контрольные суммы
 * @param {string} fileName имя файла, содержащего список файлов для работы
 * @returns очищенный упорядоченный массив путей к файлам
 */
const loadFileList = (fileName) =>
	fs
		.readFileSync(fileName, 'utf8')
		.split(/[\r\n]+/)
		.map((s) => s.trim())
		.filter(Boolean)
		.sort();

// const getFileSize = (fileName) => {
// 	let fileSize = NaN;
// 	try {
// 		const stats = fs.statSync(fileName);
// 		fileSize = stats.size;
// 	} catch (error) {
// 		console.error(error);
// 	}
// 	return fileSize;
// };

// Пока решил, что при ошибках скрипт будет просто вываливаться с ошибкой.
/**
 * Рассчитывает размер файла
 * @param {string} fileName имя файла
 * @returns размер файла в байтах
 */
const getFileSize = (fileName) => fs.statSync(fileName).size;

/**
 * Рассчитывает контрольную сумму md5 файла
 * @param {string} fileName имя файла
 * @returns промис, разрешающийся контрольной суммой md5 файла
 */
const getChecksum = (fileName) =>
	new Promise((resolve, reject) => {
		fs.readFile(fileName, function (err, buf) {
			resolve(md5(buf));
		});
	});

/**
 * Рассчитывает контрольные суммы списка файлов
 * @param {string[]} fileList массив путей к файлам
 * @returns промис, разрешающийся массивом типа [fileName, checksum, fileSize][]
 */
const generateChecksumForList = async (fileList, showNotExists = true) => {
	const checksumList = [];
	const notExistsList = [];
	for (const fileName of fileList) {
		if (!fs.existsSync(fileName)) {
			notExistsList.push(fileName);
			continue;
		}
		const fileSize = getFileSize(fileName);
		const checksum = await getChecksum(fileName);
		console.log(`Generated ${processedFileColor(fileName)}\n#${checksum}\tsize: ${fileSize} b\n`);
		checksumList.push([fileName, checksum, fileSize]);
	}
	if (showNotExists && notExistsList.length !== 0)
		console.log(
			`${errorColor('ERROR: The following files are not listed on your computer:')}\n${chalk.red(
				notExistsList.join('\n')
			)}\n`
		);
	return checksumList;
};

const fileColor = chalk.green;
const processedFileColor = chalk.gray;
const errorColor = chalk.yellow.bgRed.bold;
const infoColor = chalk.cyan;

module.exports = {
	DATA_PATH,
	fileListFileName,
	checksumFileName,
	loadFileList,
	generateChecksumForList,
	fileColor,
};

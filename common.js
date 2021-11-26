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

/**
 * Рассчитывает размер файла
 * @param {string} fileName имя файла
 * @returns строка размера файла в байтах
 */
const getFileSize = (fileName) => fs.statSync(fileName).size.toString();

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
 * Выводит текст ошибки со списком элементов
 * @param {string[]} fileList список элементов для вывода
 * @param {string} errorMessage сообщение об ошибке
 */
const printListError = (fileList, errorMessage = '') => {
	console.log(
		`${errorFilesColor(`ERROR: ${errorMessage} (${fileList.length}):`)}\n${chalk.keyword('orange')(
			fileList.map((text, index) => `${index + 1}. ${text}`).join('\n')
		)}\n`
	);
};

/**
 * Рассчитывает контрольные суммы списка файлов
 * @param {string[]} fileList массив путей к файлам
 * @param {boolean} verbose выводить ли уведомления
 * @returns промис, разрешающийся массивом вида [fileName, checksum, fileSize][]
 */
const generateChecksumForList = async (fileList, verbose = true) => {
	const checksumList = [];
	const notExistsList = [];
	for (const fileName of fileList) {
		if (!fs.existsSync(fileName)) {
			notExistsList.push(fileName);
			continue;
		}
		const fileSize = getFileSize(fileName);
		const checksum = await getChecksum(fileName);
		if (verbose) console.log(`Generated ${processedFileColor(fileName)}\n#${checksum}\tsize: ${fileSize} b\n`);
		checksumList.push([fileName, checksum, fileSize]);
	}
	if (verbose && notExistsList.length !== 0)
		printListError(notExistsList, "Файли, наявні у списку, але відсутні на комп'ютері");
	return checksumList;
};

/**
 * Возвращает множество, содержащие элементы, входящие в fromSet и не входящие в toSet
 * @param {Set} fromSet исходное множество
 * @param {Set} toSet конечное множество
 * @returns разница между множествами
 */
const getSetDifference = (fromSet, toSet) => new Set([...fromSet].filter((x) => !toSet.has(x)));

/**
 * Возвращает множество, содержащие элементы, входящие и в fromSet и в toSet
 * @param {Set} fromSet исходное множество
 * @param {Set} toSet конечное множество
 * @returns пересечение множеств
 */
const getSetIntersection = (fromSet, toSet) => new Set([...fromSet].filter((x) => toSet.has(x)));

const fileColor = chalk.yellow;
const processedFileColor = chalk.gray;
const errorFilesColor = chalk.yellow.bgRed.bold;
const successColor = chalk.green;
const errorColor = errorFilesColor;
const infoColor = chalk.cyan;

module.exports = {
	DATA_PATH,
	fileListFileName,
	checksumFileName,
	loadFileList,
	generateChecksumForList,
	fileColor,
	successColor,
	errorColor,
	getSetDifference,
	getSetIntersection,
	printListError,
};

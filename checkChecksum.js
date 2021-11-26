const fs = require('fs');
const {
	loadFileList,
	generateChecksumForList,
	fileListFileName,
	fileColor,
	checksumFileName,
	getSetDifference,
	printListError,
	successColor,
	errorColor,
} = require('./common');

console.log('File checksum verification program.\n');
console.log(`The list of files is ${fileColor(fileListFileName)}\n`);

/**
 * Загружает информацию из файла, содержащего посчитанные контрольные суммы файлов
 * @param {string} fileListFileName имя файла, содержащего посчитанные контрольные суммы
 * @returns массив контрольных сумм вида [fileName, checksum, fileSize][]
 */
const getModelChecksum = (fileListFileName) =>
	fs
		.readFileSync(fileListFileName, 'utf8')
		.split('\n')
		.filter(Boolean)
		.sort()
		.map((s) => s.split('\t'));

/**
 * Возвращает объект, ключами которого являются имена файлов и значениями объекты,
 * содержащие контрольных суммы и размеры файлов
 * @param {[string, string, string][]} modelChecksumList массив контрольных сумм вида [fileName, checksum, fileSize][]
 * @returns объект контрольных сумм типа {[key: string]: {checksum: string, fileSize: string}}
 */
const getModel = (modelChecksumList) => {
	const model = {};
	for (const [fileName, checksum, fileSize] of modelChecksumList) {
		model[fileName] = { checksum, fileSize };
	}
	return model;
};

/**
 * Определяет, все ли файлы из списка modelList находятся в списке currentList.
 * В случае нахождения файлов, которых нет, выводит соответствующие сообщение об ошибке.
 * @param {[string, string, string][]} modelList эталонный список вида [fileName, checksum, fileSize][]
 * @param {[string, string, string][]} currentList текущий список вида [fileName, checksum, fileSize][]
 * @param {string} message сообщение, которое будет выведено в случае, если некоторые файлы не найдены
 * @returns количество элементов из списка modelList, отсутствующие в списке currentList
 */
const checkFilesMutualExists = (modelList, currentList, message) => {
	const modelSet = new Set(modelList.map((item) => item[0]));
	const currentSet = new Set(currentList.map((item) => item[0]));
	const differenceSet = getSetDifference(modelSet, currentSet);
	if (differenceSet.size !== 0) printListError([...differenceSet], message);
	return differenceSet.size;
};

/**
 * Определяет соответствие контрольных сумм файлов списка checksumList контрольным суммам,
 * находящимся в эталонном списке modelChecksumList.
 * В случае нахождения различий выводит соответствующие сообщение об ошибке.
 * @param {*} modelChecksumList эталонный список вида [fileName, checksum, fileSize][]
 * @param {*} checksumList текущий список вида [fileName, checksum, fileSize][]
 * @returns количество файлов, для которых различаются контрольные суммы
 */
const checkChecksumChanged = (modelChecksumList, checksumList) => {
	const model = getModel(modelChecksumList);
	const checksumErrors = [];
	for (const [fileName, checksum, fileSize] of checksumList) {
		const dataFromModel = model[fileName];
		if (!dataFromModel) continue;
		const currentErrors = [];
		if (checksum !== dataFromModel.checksum) currentErrors.push('відрізняється контрольна сума файлу');
		if (fileSize !== dataFromModel.fileSize) currentErrors.push('відрізняється розмір файлу');
		if (currentErrors.length !== 0) checksumErrors.push(`"${fileName}": ${currentErrors.join('; ')}.`);
	}
	if (checksumErrors.length !== 0) printListError(checksumErrors, 'Файли, властивості яких відмінні від контрольних');
	return checksumErrors.length;
};

!(async function () {
	// Загрузка эталонных контрольных сумм
	const modelChecksumList = getModelChecksum(checksumFileName);

	// Расчет текущих контрольных сумм
	const fileList = loadFileList(fileListFileName);
	const checksumList = await generateChecksumForList(fileList, false);

	let errorCount = checkFilesMutualExists(
		modelChecksumList,
		checksumList,
		"Файли, наявні в контрольному списку, але наразі відсутні на комп'ютері"
	);
	errorCount += checkFilesMutualExists(
		checksumList,
		modelChecksumList,
		"Файли, наразі наявні на комп'ютері, але відсутні в контрольному списку"
	);
	errorCount += checkChecksumChanged(modelChecksumList, checksumList);
	if (errorCount === 0)
		console.log(successColor('Перевірка контрольних сум успішно виконана. Розбіжностей між файлами не виявлено.'));
	else console.log(errorColor(`Перевірка виконана. Кількість виявлених помилок: ${errorCount}`));
})();

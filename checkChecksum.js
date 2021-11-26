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

const getModelChecksum = (fileListFileName) =>
	fs
		.readFileSync(fileListFileName, 'utf8')
		.split('\n')
		.filter(Boolean)
		.sort()
		.map((s) => s.split('\t'));

const getModel = (modelChecksumList) => {
	const model = {};
	for (const [fileName, checksum, fileSize] of modelChecksumList) {
		model[fileName] = { checksum, fileSize };
	}
	return model;
};

const checkMutualFiles = (modelList, currentList, message) => {
	const modelSet = new Set(modelList.map((item) => item[0]));
	const currentSet = new Set(currentList.map((item) => item[0]));
	const differenceSet = getSetDifference(modelSet, currentSet);
	if (differenceSet.size !== 0) printListError([...differenceSet], message);
	return differenceSet.size;
};

const checkChecksumChanged = (modelChecksumList, checksumList) => {
	const model = getModel(modelChecksumList);
	const checksumErrors = [];
	for (const [fileName, checksum, fileSize] of checksumList) {
		const dataFromModel = model[fileName];
		if (!dataFromModel) continue;
		const currentErrors = [];
		if (checksum !== dataFromModel.checksum) currentErrors.push('відрізняється контрольна сума');
		if (fileSize !== dataFromModel.fileSize) currentErrors.push('відрізняється розмір файлу');
		if (currentErrors.length !== 0) checksumErrors.push(`"${fileName}" ${currentErrors.join('; ')}.`);
	}
	if (checksumErrors.length !== 0) printListError(checksumErrors, 'Відмінності файлів');
	return checksumErrors.length;
};

!(async function () {
	// Загрузка эталонных контрольных сумм
	const modelChecksumList = getModelChecksum(checksumFileName);

	// Расчет текущих контрольных сумм
	const fileList = loadFileList(fileListFileName);
	const checksumList = await generateChecksumForList(fileList, false);

	let errorCount = checkMutualFiles(
		modelChecksumList,
		checksumList,
		'Файли, присутні в контрольному списку, та наразі відсутні'
	);
	errorCount += checkMutualFiles(
		checksumList,
		modelChecksumList,
		'Файли, присутні наразі, та відсутні в контрольному списку'
	);
	errorCount += checkChecksumChanged(modelChecksumList, checksumList);
	if (errorCount === 0)
		console.log(successColor('Перевірка контрольних сум успішно виконана. Розбіжностей між файлами не виявлено.'));
	else console.log(errorColor(`Перевірка виконана. Кількість виявлених помилок: ${errorCount}`));
})();

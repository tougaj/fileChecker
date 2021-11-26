const fs = require('fs');
const path = require('path');
const { fileListFileName, checksumFileName, DATA_PATH, loadFileList, generateChecksumForList } = require('./common');

console.log('File checksum generation program.');
console.log(`The list of files is downloaded from the file "${fileListFileName}"\n`);

/**
 * Записывает контрольные суммы в файл в формате "fileName\tchecksum\tfileSize\n".
 * Если файл с именем fileName уже существует, то перед записью контрольных сумм
 * переименовывает этот файл.
 * @param {string} fileName имя файла, в который будут записаны контрольные суммы
 * @param {*} checksumList массив контрольных сумм файлов типа [fileName, checksum, fileSize][]
 */
const saveChecksum = (fileName, checksumList) => {
	if (fs.existsSync(fileName))
		fs.renameSync(fileName, path.resolve(DATA_PATH, `checksum_${new Date().valueOf()}.old`));
	fs.writeFileSync(fileName, checksumList.map((item) => item.join('\t')).join('\n'));
};

!(async function () {
	const fileList = loadFileList(fileListFileName);
	const checksumList = await generateChecksumForList(fileList);
	saveChecksum(checksumFileName, checksumList);

	console.log(`\nThe file list checksums are calculated and written to the file "${checksumFileName}"`);
})();

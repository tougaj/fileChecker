const fs = require('fs');
const { fileListFileName, checksumFileName, loadFileList, generateChecksumForList, fileColor } = require('./common');

console.log('File checksum generation program.\n');
console.log(`The list of files is ${fileColor(fileListFileName)}\n`);

/**
 * Записывает контрольные суммы в файл в формате "fileName\tchecksum\tfileSize\n".
 * Если файл с именем fileName уже существует, то перед записью контрольных сумм
 * переименовывает этот файл.
 * @param {string} fileName имя файла, в который будут записаны контрольные суммы
 * @param {[string, string, string][]} checksumList массив контрольных сумм файлов типа [fileName, checksum, fileSize][]
 */
const saveChecksum = (fileName, checksumList) => {
	if (fs.existsSync(fileName)) fs.renameSync(fileName, `${fileName}_${new Date().valueOf()}.old`);
	fs.writeFileSync(fileName, checksumList.map((item) => item.join('\t')).join('\n'));
};

!(async function () {
	const fileList = loadFileList(fileListFileName);
	const checksumList = await generateChecksumForList(fileList);
	saveChecksum(checksumFileName, checksumList);

	console.log(`The file list checksums are calculated and written to the file ${fileColor(checksumFileName)}`);
})();

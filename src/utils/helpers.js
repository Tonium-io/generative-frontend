/**
 * Read binary file to ArrayBuffer
 * @param file
 * @return {Promise<ArrayBuffer>}
 */
export const readBinaryFile = async (file) => {
  const response = await fetch(file);
  return response.arrayBuffer();
};

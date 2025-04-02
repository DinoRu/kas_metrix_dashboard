const config = () => {
  const baseUrl = 'http://62.217.182.141:8000';
  const upload = `${baseUrl}/task/upload`;
  const download = `${baseUrl}/task/download`;
  const downloadApk = `${baseUrl}/task/download_apk`;
  const clear = `${baseUrl}/task/clear`;
  const update = (taskId) => `${baseUrl}/tasks/${taskId}`;
  const localuri = `${baseUrl}/auth`;
  const getusers = `${localuri}/users`;
  const createuser = `${localuri}/signup`;
  const login = `${localuri}/login`;
  const deleteuser = (userId) => `${localuri}/${userId}`;
  const updateuser = (userId) => `${localuri}/update/${userId}`;
  const getuser = (userId) => `${localuri}/users/${userId}`;

  return {
    baseUrl,
    upload,
    download,
    downloadApk,
    clear,
    update,
    getusers,
    createuser,
    login,
    deleteuser,
    updateuser,
    getuser,
  };
};

export default config;

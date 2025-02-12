const config = () => {
    const baseUrl = "http://62.217.182.141:8000"
    const upload = `${baseUrl}/task/upload`
    const download = `${baseUrl}/task/download`
    const clear = `${baseUrl}/task/clear`
    const update = (taskId) => `${baseUrl}/tasks/${taskId}`

    return {
        baseUrl,
        upload,
        download,
        clear,
        update
    }
}



export default config;
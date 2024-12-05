const config = () => {
    const baseUrl = "http://62.217.182.141:8000"
    const upload = `${baseUrl}/tasks/upload`
    const download = `${baseUrl}/tasks/download`
    const clear = `${baseUrl}/tasks`
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
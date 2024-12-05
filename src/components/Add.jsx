import React, { useState } from 'react'
import { Button } from './Button'
import { FaUpload } from 'react-icons/fa6';
import axios from 'axios';
import config from '../config/config';
import Modal from './Modal';


const Add = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    }

    const handleCloseModel = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
    }

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    }

    const handleUpload = () => {
        const apiUrl = config().upload;
        if (!selectedFile) {
            alert('Пожалуйста, выберите файл!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            axios.post(
                apiUrl,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Custom-Header": "value"
                    }
                }
            ).then((res) => {
                console.log("File uploaded successfully!:", res.data);
                alert("File successfully uploaded");
                handleCloseModel();
            }).catch((e) => {
                console.error(e.message);
                alert("Error uploading file:")
            })
        } catch (error) {
            console.error("Error uploading file:", error.response || error.message);
            alert("Error uploading file!");
        }
    }

  return (
    <div className="">
        <Button onClick={handleOpenModal} className="flex items-center">
            <FaUpload className='mr-2' />
            Загрузить Файл
        </Button>
        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModel}>
            <h2 className='text-lg font-bold mb-4'>Загружать Файл</h2>
            <input type="file" onChange={handleFileChange} placeholder='Загрузить Файл'/>
            <Button className="" onClick={handleUpload}
            >
                Загружать
            </Button>
        </Modal>
    </div>
  )
}

export default Add
import React, { useState } from 'react'
import { Button } from './Button';
import { FaDeleteLeft, FaSpinner} from 'react-icons/fa6';
import config from '../config/config';
import axios from 'axios';

const Delete = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleted = async () => {
      setIsDeleting(true);
      const apiUrl = config().clear;
      try {
        const response = await axios.delete(apiUrl);
        if (response.status === 204) {
          alert("Файл успешно удален");
          console.log("Файл успешно удален");
        } else {
          console.log("Не успешно");
        }
      } catch (e) {
        console.error("Error to clearing files", e);
      } finally {
        setIsDeleting(false);
      }
    }
  return (
    <Button
        className={`bg-red-500 hover:bg-red-600 flex items-center ${isDeleting ? 'opacity-75 cursor-not-allowed' : ""} `}
        onClick={!isDeleting ? handleDeleted : null}
    >
        { isDeleting ? (
                <FaSpinner className="animate-spin text-white" size={20} />
            ) : (
                <>
                    <FaDeleteLeft className="mr-2" size={20} />
                    Удалить
                </>
            )}
    </Button>
  )
}

export default Delete
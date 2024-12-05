import React from 'react'
import { Button } from './Button';
import { FaDownload } from 'react-icons/fa6';
import axios from 'axios';
import config from '../config/config';

const Download = () => {
    
    const handleDownload = async () => {

        try {

            const apiurl = config().download;
            const response = await axios.post(
            apiurl,
            {},
            {
              responseType: "blob",
            }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Reports.xlsx");
          document.body.appendChild(link);
          link.click();
        } catch (e) {
          console.error("Error download file: ", e);
        }
      };

  return (
    <Button
        className="bg-green-500 hover:bg-green-600 flex items-center"
        onClick={handleDownload}
    >
        <FaDownload className='mr-2' />
        Скачать
    </Button>
  )
}

export default Download
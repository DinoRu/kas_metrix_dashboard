import React from 'react'
import { Button } from './Button';

const Modal = ({ isOpen, onClose, children}) => {
    if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
        <div className="bg-white rounded-lg p-6 w-100 shadow-lg relative">
            {children}
            <Button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                    X
            </Button>
        </div>
    </div>
  )
}

export default Modal
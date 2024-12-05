
# 📂 TEC-BLOK Features with React, Axios, and Modal

A simple React project that demonstrates how to implement a file upload feature using **Axios**, a dynamic modal component, and environment variables for API configuration.

## 🚀 Features

- 📤 **File Upload**: Upload files to a backend server.
- 💡 **Dynamic Modal**: A reusable modal component for user interaction.
- ⚙️ **Environment Configurations**: API URLs are stored in a `.env` file for better flexibility.
- 🔧 **Customizable**: Easily adaptable for different backend configurations and endpoints.

---

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dinoru/tec_bloc_interface.git
   cd tec_bloc_interface
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   _or_
   ```bash
   yarn
   ```

3. Create a `.env` file in the root directory and add your API URLs:
   ```env
   REACT_APP_API_URL=http://62.217.182.141:8000
   REACT_APP_UPLOAD_ENDPOINT=/tasks/upload
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   _or_
   ```bash
   yarn start
   ```

---

## 📁 Project Structure

```
├── src
│   ├── components
│   │   ├── Button.js       # Reusable button component
│   │   ├── Modal.js        # Reusable modal component
│   │   └── Add.js
|   |       # Main feature component
│   ├── App.js              # Application root component
│   ├── index.js            # Entry point
│   └── config.js           # API configuration file
├── .env                    # Environment variables for API URLs
├── package.json            # Project metadata and dependencies
└── README.md               # Project documentation
```

---

## 💻 Usage

### Running the Application
- Click the **"Загрузить Файл"** button to open the upload modal.
- Select a file and upload it.
- If successful, you will see a success alert; otherwise, an error alert will be displayed.

### Customizing API Endpoints
- Modify the `.env` file to set the correct API URL and upload endpoint.

---

## 📦 Dependencies

- **React**: Frontend library for building user interfaces.
- **Axios**: Promise-based HTTP client for API communication.
- **React Icons**: For beautiful, scalable icons.
- **Tailwind CSS**: For styling (if applicable).

Install all dependencies via:
```bash
npm install
```
_or_
```bash
yarn
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## ✨ Acknowledgments

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Modal Example](https://reactjs.org/docs/getting-started.html)
- [React Icons](https://react-icons.github.io/react-icons/)

---

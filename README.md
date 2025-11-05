# 🧠 AI-Powered Nanoparticle Synthesis & Analysis
### A Collaborative Project between the Biomedical and Software Engineering Departments  
### A Sustainable Approach to Nanotechnology using Green Synthesis and Artificial Intelligence  

---

## 🌿 Overview
This Capstone project integrates **green nanotechnology** with **artificial intelligence** to create a complete system that can both **synthesize** and **analyze nanoparticles**.

- The **Biomedical Engineering Department** conducts **green synthesis** of nanoparticles and generates **SEM (Scanning Electron Microscope)** images.  
- The **Software Engineering Department** develops an **AI-driven system** to automatically analyze these images and classify nanoparticles by **shape**, **size**, and **distribution**.

Together, the two departments demonstrate how **AI accelerates materials research** and supports **sustainable nanotechnology**.

---

## 🧩 Project Architecture

```bash
ai-powered-nanoparticle-synthesis/
├─ data/ # BME + Kaggle SEM images & labels
│ ├─ BME/SEM_Images/
│ ├─ KAGGLE/SEM_Images/
│ ├─ PROCESSED/
│ └─ labels.csv
│
├─ ml/ # Machine Learning (TensorFlow CNN)
│ ├─ preprocess.py
│ ├─ dataset.py
│ ├─ model_cnn.py
│ ├─ train.py
│ ├─ infer.py
│ └─ config.yaml
│
├─ backend/ # Django REST API
│ ├─ manage.py
│ ├─ api/
│ └─ media/
│
├─ web/ # React Frontend (UI)
│ ├─ src/
│ └─ package.json
│
├─ ops/ # Policies & documentation
│ ├─ data_policy.md
│ ├─ label_guidelines.md
│ └─ kaggle_checklist.md
│
├─ README.md
└─ .gitignore


---

## 🎯 Objectives
- ✅ Automate the **classification of nanoparticles** in SEM images.  
- ✅ Predict **shape (spherical / rod / cubic)**, **size (10–50 nm / 50–100 nm)**, and **distribution (uniform / clustered)**.  
- ✅ Achieve **≥ 85 % classification accuracy** using a CNN with data augmentation.  
- ✅ Provide a **user-friendly web interface** for uploads, predictions, and history tracking.  
- ✅ Ensure **GDPR / KVKK compliance** for all image data.

---

## ⚗️ Subsystems

### 🧪 Biomedical Engineering – Green Synthesis
- Perform **plant-based (eco-friendly)** nanoparticle synthesis.  
- Capture **SEM images** of synthesized nanoparticles.  
- Provide labeled datasets (`shape`, `size`, `distribution`) for AI model training.  

📁 Folder: `data/BME/`

---

### 💻 Software Engineering – AI & Web Development
- Implement **image preprocessing, data augmentation, and CNN training** in TensorFlow.  
- Build a **Django REST API** for image upload and real-time model inference.  
- Develop a **React-based UI** for user login, upload, results visualization, and history management.  
- Integrate a **MySQL / SQLite database** for users, results, and logs.

📁 Folders: `ml/`, `backend/`, `web/`

---

## 🔗 Integration Flow
1. Biomedical team provides labeled SEM images.  
2. Software team preprocesses and trains the CNN model.  
3. The trained model (`cnn_model.h5`) is integrated into Django for inference.  
4. The user uploads SEM images through the React interface.  
5. The backend returns **AI predictions** for visualization and storage.  

---

## 🧠 Technologies Used
| Category | Tools / Frameworks |
|-----------|--------------------|
| Machine Learning | TensorFlow 2.16, scikit-learn, OpenCV, NumPy, Pandas |
| Backend | Django 5.1, Django REST Framework, python-dotenv, CORS Headers |
| Frontend | React + Vite, Axios, TypeScript |
| Database | SQLite (dev) / MySQL (production) |
| DevOps & Docs | Git, VS Code, YAML configs, Markdown |

---

## 🧪 System Workflow
1. **Image Preprocessing** – resize 128×128, grayscale, CLAHE contrast, Gaussian blur.  
2. **Data Augmentation** – rotation ±15°, horizontal flip, zoom, translation.  
3. **CNN Training** – 5-layer conv-BN-ReLU architecture; early-stopping on validation accuracy.  
4. **Inference API** – loads model once, predicts shape/size/distribution.  
5. **Frontend** – user uploads → sees instant results → stored in history.

---

## 📅 Timeline
| Phase | Description | Owner |
|--------|--------------|-------|
| Phase 1 | Dataset collection & labeling | Biomedical |
| Phase 2 | Data preprocessing & augmentation | Software |
| Phase 3 | CNN model development | Software |
| Phase 4 | Web & API integration | Software |
| Phase 5 | Validation & presentation | Both |

---

## 📁 Documentation
All reports, figures, and deliverables are in the `/ops/` and `/docs/` folders.

---

## 👥 Team Roles
| Role | Department | Responsibility |
|------|-------------|----------------|
| Project Lead | Biomedical | Synthesis & dataset supervision |
| AI Developer | Software | CNN design & training |
| Backend Developer | Software | Django REST API integration |
| Frontend Developer | Software | React UI design |
| Data Analyst | Biomedical | Image labeling & validation |

---

## 📄 License
This project is for academic and research purposes only.  
© 2025 – Biomedical & Software Engineering Departments, Bahcesehir University.

---

> _“Where sustainable science meets intelligent technology.”_


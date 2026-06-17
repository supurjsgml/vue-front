<template>
    <button class="btn btn-premium-download">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-square download-icon" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5 2.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
        </svg>
        <span>DownLoad</span>
    </button>
</template>

<style scoped>
.btn-premium-download {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.15);
}

.btn-premium-download:hover {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%);
  border-color: rgba(52, 211, 153, 0.6);
  color: #a7f3d0;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.3);
}

.btn-premium-download:active {
  transform: translateY(0);
}

.download-icon {
  transition: transform 0.3s ease;
}

.btn-premium-download:hover .download-icon {
  transform: translateY(1px);
}
</style>
// Create Campaign Page JS
document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000";
  const token = localStorage.getItem("token");

  // Check auth
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Initialize Quill editor
  const quill = new Quill("#quillEditor", {
    theme: "snow",
    placeholder: "Escribe la historia de tu campaña...",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    },
  });

  // Load categories
  loadCategories();

  // Load user info
  loadUserInfo();

  // Image URL preview
  const imageUrlInput = document.getElementById("imageUrl");
  const previewImage = document.getElementById("campaignImage");

  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", function () {
      const url = this.value.trim();
      if (url) {
        previewImage.src = url;
        previewImage.onerror = function () {
          this.src =
            "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";
        };
      } else {
        previewImage.src =
          "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";
      }
    });
  }

  // Button actions
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const observationsBtn = document.getElementById("observationsBtn");
  const sendBtn = document.getElementById("sendBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      if (confirm("¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.")) {
        window.location.href = "my-campaigns.html";
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveCampaign(false);
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      saveCampaign(true);
    });
  }

  if (observationsBtn) {
    observationsBtn.addEventListener("click", function () {
      alert("Las observaciones estarán disponibles después de enviar la campaña para revisión.");
    });
  }

  async function loadCategories() {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (response.ok) {
        const categories = await response.json();
        const select = document.getElementById("campaignCategory");
        if (select) {
          select.innerHTML = '<option value="">Selecciona una categoría</option>';
          categories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadUserInfo() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        const creatorName = document.getElementById("creatorName");
        const creatorAvatar = document.getElementById("creatorAvatar");

        if (creatorName) {
          creatorName.textContent = user.name || user.username;
        }
        if (creatorAvatar && user.profile_image_url) {
          creatorAvatar.src = user.profile_image_url;
        }
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  }

  async function saveCampaign(send = false) {
    const title = document.getElementById("campaignTitle")?.value.trim();
    const shortDescription = document.getElementById("shortDescription")?.value.trim();
    const goal = document.getElementById("campaignGoal")?.value;
    const categoryId = document.getElementById("campaignCategory")?.value;
    const expirationDate = document.getElementById("expirationDate")?.value;
    const imageUrl = document.getElementById("imageUrl")?.value.trim();
    const fullDescription = quill.root.innerHTML;

    // Validation
    if (!title) {
      alert("Por favor, ingresa un título para la campaña.");
      return;
    }
    if (!shortDescription) {
      alert("Por favor, ingresa una descripción corta.");
      return;
    }
    if (!goal || goal <= 0) {
      alert("Por favor, ingresa una meta de recaudación válida.");
      return;
    }
    if (!categoryId) {
      alert("Por favor, selecciona una categoría.");
      return;
    }
    if (!expirationDate) {
      alert("Por favor, selecciona una fecha de expiración.");
      return;
    }

    const campaignData = {
      campaign_name: title,
      campaign_description: shortDescription,
      campaign_text: fullDescription,
      campaign_goal: parseFloat(goal),
      campaign_image_url: imageUrl || null,
      expiration_date: expirationDate,
      category_id: parseInt(categoryId),
      campaign_state_id: send ? 2 : 1, // 2 = pending review, 1 = draft
    };

    try {
      const response = await fetch(`${API_URL}/campaigns/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        const result = await response.json();
        if (send) {
          alert("¡Campaña enviada para revisión exitosamente!");
        } else {
          alert("¡Campaña guardada como borrador!");
        }
        window.location.href = "my-campaigns.html";
      } else {
        const error = await response.json();
        alert("Error al guardar la campaña: " + (error.detail || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("Error de conexión al guardar la campaña.");
    }
  }
});

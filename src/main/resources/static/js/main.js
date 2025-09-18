// Sử dụng relative path để dễ deploy cả local và Render
const apiUrl = "/laptop";

// Kiểm tra đăng nhập khi tải trang
document.addEventListener("DOMContentLoaded", function () {
  if (!isLoggedIn()) {
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("mainContent").style.display = "none";
  } else {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    fetchLaptops();
    updateUserDisplay();
  }
});

// Xử lý đăng nhập
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  showLoading();

  fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then((data) => {
      if (data.token) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        fetchLaptops();
        updateUserDisplay();
        alert("Đăng nhập thành công!");
      }
    })
    .catch((error) => {
      console.error("Lỗi đăng nhập:", error);
      alert(
        "Đăng nhập thất bại: " +
          (error.message || "Vui lòng kiểm tra lại thông tin đăng nhập")
      );
    })
    .finally(() => {
      hideLoading();
    });
}

// Xử lý đăng xuất
function logout() {
  localStorage.clear();
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("mainContent").style.display = "none";
}

// Kiểm tra trạng thái đăng nhập
function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// Hàm lấy danh sách laptop
function fetchLaptops() {
  showLoading();
  fetch(`${apiUrl}/getAll`)
    .then((response) => response.json())
    .then((data) => {
      laptopsList = data;
      displayLaptops(laptopsList);
    })
    .catch((error) => {
      console.error("Error fetching laptop data:", error);
      alert("Lỗi khi tải danh sách laptop!");
    })
    .finally(() => {
      hideLoading();
    });
}

// Upload hình ảnh khi thêm laptop
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/laptops", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload ảnh thất bại");
  }

  return await response.json();
}

// Thêm laptop
async function addLaptop() {
  if (!isLoggedIn()) {
    alert("Vui lòng đăng nhập!");
    return;
  }

  const laptopName = document.getElementById("addLaptopName").value;
  const trademark = document.getElementById("addTrademark").value;
  const memory = document.getElementById("addMemory").value;
  const ram = document.getElementById("addRAM").value;
  const price = document.getElementById("addPrice").value;
  const chip = document.getElementById("addChip").value;

  if (!laptopName || !trademark || !memory || !ram || !price || !chip) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  let imageUrl = null;
  const imageFile = document.getElementById("addImage").files[0];
  if (imageFile) {
    try {
      const data = await uploadImage(imageFile);
      imageUrl = data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Lỗi khi upload hình ảnh!");
      return;
    }
  }

  const laptop = {
    laptopName,
    trademark,
    parameter: {
      memory,
      ram,
      price: parseFloat(price),
      chip,
    },
    imageUrl,
  };

  showLoading();
  fetch(`${apiUrl}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(laptop),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then(() => {
      alert("Thêm laptop thành công!");
      openTab("allLaptopsTab");
      fetchLaptops();
    })
    .catch((error) => {
      console.error("Error adding laptop:", error);
      alert("Lỗi khi thêm laptop: " + (error.message || "Vui lòng thử lại"));
    })
    .finally(() => {
      hideLoading();
    });
}

// Đổi mật khẩu
function submitChangePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const username = localStorage.getItem("username");

  if (!oldPassword || !newPassword) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  showLoading();
  fetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      oldPassword,
      newPassword,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.message === "Đổi mật khẩu thành công") {
        logout();
      }
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi đổi mật khẩu!");
    })
    .finally(() => {
      hideLoading();
    });
}

// Đặt hàng (tạo hóa đơn)
async function processPurchase() {
  if (!selectedLaptopId) {
    alert("Vui lòng chọn laptop để mua!");
    return;
  }

  const customerName = document.getElementById("customerName").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const customerAddress = document.getElementById("customerAddress").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const laptop = laptopsList.find((l) => l.id === selectedLaptopId);
  if (!laptop) {
    alert("Không tìm thấy thông tin laptop!");
    return;
  }

  const invoice = {
    laptop,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    paymentMethod,
    totalAmount: laptop.parameter.price,
    status: "PENDING",
  };

  try {
    const response = await fetch("/api/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      throw new Error("Lỗi khi tạo hóa đơn");
    }

    await response.json();
    alert("Đặt hàng thành công! Vui lòng kiểm tra email.");
    hidePurchaseForm();
  } catch (error) {
    console.error("Error:", error);
    alert("Lỗi khi xử lý đơn hàng: " + error.message);
  }
}

// Các biến global
let laptopsList = [];
let selectedLaptopId = null;

// Hàm hiển thị loading
function showLoading() {
  // Có thể thêm spinner loading nếu cần
}

// Hàm ẩn loading
function hideLoading() {
  // Có thể ẩn spinner loading nếu cần
}

// Hàm cập nhật hiển thị user
function updateUserDisplay() {
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("userDisplay").textContent = `Xin chào, ${username}`;
  }
}

// Hàm chuyển tab
function openTab(tabName) {
  // Ẩn tất cả tab content
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Ẩn tất cả tab buttons
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Hiển thị tab được chọn
  document.getElementById(tabName).classList.add('active');
  
  // Highlight tab button được chọn
  event.target.classList.add('active');
  
  // Nếu là tab danh sách laptop, load lại dữ liệu
  if (tabName === 'allLaptopsTab') {
    fetchLaptops();
  }
}

// Hàm preview hình ảnh
function previewImage(input, previewId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById(previewId);
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

// Hàm hiển thị danh sách laptop
function displayLaptops(laptops) {
  const tbody = document.getElementById('laptopTableBody');
  tbody.innerHTML = '';
  
  laptops.forEach(laptop => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${laptop.id}</td>
      <td>${laptop.laptopName}</td>
      <td>${laptop.trademark}</td>
      <td>${laptop.parameter.memory}</td>
      <td>${laptop.parameter.ram}</td>
      <td>${laptop.parameter.price.toLocaleString()} VNĐ</td>
      <td>${laptop.parameter.chip}</td>
      <td><img src="${laptop.imageUrl || '#'}" alt="Laptop" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>
        <button onclick="selectLaptopForPurchase(${laptop.id})" class="btn-buy">
          <i class="fas fa-shopping-cart"></i> Mua
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Hàm chọn laptop để mua
function selectLaptopForPurchase(laptopId) {
  selectedLaptopId = laptopId;
  document.getElementById('purchaseForm').classList.remove('hidden');
}

// Hàm ẩn form mua hàng
function hidePurchaseForm() {
  document.getElementById('purchaseForm').classList.add('hidden');
  selectedLaptopId = null;
}

// Hàm cập nhật laptop
async function updateLaptop() {
  if (!isLoggedIn()) {
    alert("Vui lòng đăng nhập!");
    return;
  }

  const id = document.getElementById("updateID").value;
  const laptopName = document.getElementById("updateLaptopName").value;
  const trademark = document.getElementById("updateTrademark").value;
  const memory = document.getElementById("updateMemory").value;
  const ram = document.getElementById("updateRAM").value;
  const price = document.getElementById("updatePrice").value;
  const chip = document.getElementById("updateChip").value;

  if (!id || !laptopName || !trademark || !memory || !ram || !price || !chip) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  let imageUrl = null;
  const imageFile = document.getElementById("updateImage").files[0];
  if (imageFile) {
    try {
      const data = await uploadImage(imageFile);
      imageUrl = data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Lỗi khi upload hình ảnh!");
      return;
    }
  }

  const laptop = {
    id: parseInt(id),
    laptopName,
    trademark,
    parameter: {
      memory,
      ram,
      price: parseFloat(price),
      chip,
    },
    imageUrl,
  };

  showLoading();
  fetch(`${apiUrl}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(laptop),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then(() => {
      alert("Cập nhật laptop thành công!");
      openTab("allLaptopsTab");
      fetchLaptops();
    })
    .catch((error) => {
      console.error("Error updating laptop:", error);
      alert("Lỗi khi cập nhật laptop: " + (error.message || "Vui lòng thử lại"));
    })
    .finally(() => {
      hideLoading();
    });
}

// Hàm xóa laptop
function deleteLaptop() {
  if (!isLoggedIn()) {
    alert("Vui lòng đăng nhập!");
    return;
  }

  const id = document.getElementById("deleteID").value;
  if (!id) {
    alert("Vui lòng nhập ID laptop cần xóa!");
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xóa laptop này?")) {
    return;
  }

  showLoading();
  fetch(`${apiUrl}/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then(() => {
      alert("Xóa laptop thành công!");
      openTab("allLaptopsTab");
      fetchLaptops();
    })
    .catch((error) => {
      console.error("Error deleting laptop:", error);
      alert("Lỗi khi xóa laptop: " + (error.message || "Vui lòng thử lại"));
    })
    .finally(() => {
      hideLoading();
    });
}

// Hàm tìm kiếm laptop
function searchLaptops() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredLaptops = laptopsList.filter(laptop => 
    laptop.laptopName.toLowerCase().includes(searchTerm) ||
    laptop.trademark.toLowerCase().includes(searchTerm) ||
    laptop.parameter.chip.toLowerCase().includes(searchTerm)
  );
  displayLaptops(filteredLaptops);
}

// Hàm sắp xếp laptop theo giá
function sortLaptops(order) {
  const sortedLaptops = [...laptopsList].sort((a, b) => {
    if (order === 'asc') {
      return a.parameter.price - b.parameter.price;
    } else {
      return b.parameter.price - a.parameter.price;
    }
  });
  displayLaptops(sortedLaptops);
}
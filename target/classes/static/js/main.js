const apiUrl = "http://localhost:8080/laptop";

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

  fetch("http://localhost:8080/api/auth/login", {
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

// Xử lý chuyển tab
function openTab(tabId) {
  // Ẩn tất cả tab content
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((tab) => {
    tab.style.display = "none";
    tab.classList.remove("active");
  });

  const tabButtons = document.querySelectorAll(".tab");
  tabButtons.forEach((button) => {
    button.classList.remove("active");
  });

  // Hiện tab được chọn
  const selectedTab = document.getElementById(tabId);
  selectedTab.style.display = "block";
  selectedTab.classList.add("active");

  // Active tab button tương ứng
  const selectedButton = document.querySelector(
    `.tab[onclick="openTab('${tabId}')"]`
  );
  selectedButton.classList.add("active");

  // Thêm animation
  animateTabChange(tabId);
}

// Biến lưu trữ danh sách laptop gốc
let laptopsList = [];

// Sửa lại hàm fetchLaptops
function fetchLaptops() {
  showLoading();
  fetch(`${apiUrl}/getAll`)
    .then((response) => response.json())
    .then((data) => {
      laptopsList = data; // Lưu danh sách gốc
      displayLaptops(laptopsList); // Hiển thị danh sách
    })
    .catch((error) => {
      console.error("Error fetching laptop data:", error);
      alert("Lỗi khi tải danh sách laptop!");
    })
    .finally(() => {
      hideLoading();
    });
}

// Hàm hiển thị danh sách laptop
function displayLaptops(laptops) {
  const tableBody = document.getElementById("laptopTableBody");
  tableBody.innerHTML = "";
  laptops.forEach((laptop) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${laptop.id || "N/A"}</td>
            <td>${laptop.laptopName || "N/A"}</td>
            <td>${laptop.trademark || "N/A"}</td>
            <td>${laptop.parameter?.memory || "N/A"}</td>
            <td>${laptop.parameter?.ram || "N/A"}</td>
            <td>${laptop.parameter?.price || "N/A"}</td>
            <td>${laptop.parameter?.chip || "N/A"}</td>
            <td>
                <img 
                    src="${
                      laptop.imageUrl
                        ? "/uploads/" + laptop.imageUrl
                        : "/images/default-laptop.png"
                    }" 
                    class="laptop-image" 
                    alt="${laptop.laptopName}"
                    onerror="this.src='/images/default-laptop.png'"
                />
            </td>
            <td>
                <button onclick="getLaptopForUpdate(${
                  laptop.id
                })" class="btn-edit">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button onclick="deleteLaptopById(${
                  laptop.id
                })" class="btn-delete">
                    <i class="fas fa-trash"></i> Xóa
                </button>
                <button onclick="showPurchaseForm(${
                  laptop.id
                })" class="btn-buy">
                    <i class="fas fa-shopping-cart"></i> Mua
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// Hàm tìm kiếm laptop
function searchLaptops() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredLaptops = laptopsList.filter(
    (laptop) =>
      laptop.laptopName.toLowerCase().includes(searchTerm) ||
      laptop.trademark.toLowerCase().includes(searchTerm) ||
      laptop.parameter?.chip.toLowerCase().includes(searchTerm)
  );
  displayLaptops(filteredLaptops);
}

// Hàm sắp xếp laptop theo giá
function sortLaptops(order) {
  const sortedLaptops = [...laptopsList].sort((a, b) => {
    const priceA = a.parameter?.price || 0;
    const priceB = b.parameter?.price || 0;
    return order === "asc" ? priceA - priceB : priceB - priceA;
  });
  displayLaptops(sortedLaptops);
}

// Xử lý thêm laptop
async function addLaptop() {
  if (!isLoggedIn()) {
    alert("Vui lòng đăng nhập!");
    return;
  }

  // Kiểm tra dữ liệu đầu vào
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

  // Upload hình ảnh nếu có
  const imageFile = document.getElementById("addImage").files[0];
  let imageUrl = null;
  if (imageFile) {
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      const response = await fetch("http://localhost:8080/api/upload/laptops", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      imageUrl = data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Lỗi khi upload hình ảnh!");
      return;
    }
  }

  const laptop = {
    laptopName: laptopName,
    trademark: trademark,
    parameter: {
      memory: memory,
      ram: ram,
      price: parseFloat(price),
      chip: chip,
    },
    imageUrl: imageUrl,
  };

  showLoading();
  fetch(`${apiUrl}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Thêm token nếu cần
    },
    body: JSON.stringify(laptop),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then((data) => {
      console.log("Laptop added:", data);
      // Xóa nội dung các trường input
      document.getElementById("addLaptopName").value = "";
      document.getElementById("addTrademark").value = "";
      document.getElementById("addMemory").value = "";
      document.getElementById("addRAM").value = "";
      document.getElementById("addPrice").value = "";
      document.getElementById("addChip").value = "";

      alert("Thêm laptop thành công!");
      // Chuyển sang tab danh sách và cập nhật
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

// Loading spinner
function showLoading() {
  // Tạo hoặc hiển thị loading spinner
  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.className = "loader";
    document.body.appendChild(loader);
  }
  loader.style.display = "block";
}

function hideLoading() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

// Hiển thị username sau khi đăng nhập
function updateUserDisplay() {
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("userDisplay").innerHTML = `
            <i class="fas fa-user"></i> ${username}
        `;
  }
}

// Animation khi chuyển tab
function animateTabChange(tabId) {
  const tab = document.getElementById(tabId);
  tab.style.animation = "fadeIn 0.5s ease-out";
}

// Xử lý đổi mật khẩu
function changePassword() {
  document.getElementById("changePasswordForm").style.display = "block";
}

function submitChangePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const username = localStorage.getItem("username");

  if (!oldPassword || !newPassword) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  showLoading();
  fetch("http://localhost:8080/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      oldPassword: oldPassword,
      newPassword: newPassword,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.message === "Đổi mật khẩu thành công") {
        document.getElementById("oldPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("changePasswordForm").style.display = "none";
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

// Thêm đoạn này vào cuối file để đảm bảo chỉ hiện tab đầu tiên khi load trang
document.addEventListener("DOMContentLoaded", function () {
  if (isLoggedIn()) {
    // Ẩn tất cả tab content trừ tab đầu tiên
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((tab, index) => {
      if (index === 0) {
        tab.style.display = "block";
        tab.classList.add("active");
      } else {
        tab.style.display = "none";
        tab.classList.remove("active");
      }
    });
  }
});

// Thêm các hàm xử lý sửa và xóa laptop

// Hàm lấy thông tin laptop để sửa
function getLaptopForUpdate(id) {
  showLoading();
  fetch(`${apiUrl}/getAll`)
    .then((response) => response.json())
    .then((data) => {
      const laptop = data.find((l) => l.id === parseInt(id));
      if (laptop) {
        // Điền thông tin vào form
        document.getElementById("updateID").value = laptop.id;
        document.getElementById("updateLaptopName").value = laptop.laptopName;
        document.getElementById("updateTrademark").value = laptop.trademark;
        document.getElementById("updateMemory").value = laptop.parameter.memory;
        document.getElementById("updateRAM").value = laptop.parameter.ram;
        document.getElementById("updatePrice").value = laptop.parameter.price;
        document.getElementById("updateChip").value = laptop.parameter.chip;

        // Chuyển sang tab update
        openTab("updateLaptopTab");
      } else {
        alert("Không tìm thấy laptop!");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Lỗi khi lấy thông tin laptop!");
    })
    .finally(() => {
      hideLoading();
    });
}

// Hàm cập nhật laptop
function updateLaptop() {
  const id = document.getElementById("updateID").value;
  if (!id) {
    alert("Vui lòng nhập ID laptop!");
    return;
  }

  const laptop = {
    laptopName: document.getElementById("updateLaptopName").value,
    trademark: document.getElementById("updateTrademark").value,
    parameter: {
      memory: document.getElementById("updateMemory").value,
      ram: document.getElementById("updateRAM").value,
      price: parseFloat(document.getElementById("updatePrice").value),
      chip: document.getElementById("updateChip").value,
    },
  };

  showLoading();
  fetch(`${apiUrl}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(laptop),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật laptop");
      }
      return response.json();
    })
    .then((data) => {
      alert("Cập nhật laptop thành công!");
      // Xóa form
      document.getElementById("updateID").value = "";
      document.getElementById("updateLaptopName").value = "";
      document.getElementById("updateTrademark").value = "";
      document.getElementById("updateMemory").value = "";
      document.getElementById("updateRAM").value = "";
      document.getElementById("updatePrice").value = "";
      document.getElementById("updateChip").value = "";

      // Chuyển sang tab danh sách và cập nhật
      openTab("allLaptopsTab");
      fetchLaptops();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Lỗi khi cập nhật laptop: " + error.message);
    })
    .finally(() => {
      hideLoading();
    });
}

// Hàm xóa laptop
function deleteLaptop() {
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
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Lỗi khi xóa laptop");
      }
      alert("Xóa laptop thành công!");
      document.getElementById("deleteID").value = "";
      // Chuyển sang tab danh sách và cập nhật
      openTab("allLaptopsTab");
      fetchLaptops();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Lỗi khi xóa laptop: " + error.message);
    })
    .finally(() => {
      hideLoading();
    });
}

// Thêm hàm xóa trực tiếp từ danh sách
function deleteLaptopById(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa laptop này?")) {
    return;
  }

  showLoading();
  fetch(`${apiUrl}/delete/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Lỗi khi xóa laptop");
      }
      alert("Xóa laptop thành công!");
      fetchLaptops();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Lỗi khi xóa laptop: " + error.message);
    })
    .finally(() => {
      hideLoading();
    });
}

// Hàm preview hình ảnh
function previewImage(input, previewId) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById(previewId);
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(input.files[0]);
  }
}

let selectedLaptopId = null;

function showPurchaseForm(laptopId) {
  selectedLaptopId = laptopId;
  document.getElementById("purchaseForm").style.display = "block";
}

function hidePurchaseForm() {
  document.getElementById("purchaseForm").style.display = "none";
  selectedLaptopId = null;
}

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
    laptop: laptop,
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    customerAddress: customerAddress,
    paymentMethod: paymentMethod,
    totalAmount: laptop.parameter.price,
    status: "PENDING",
  };

  try {
    const response = await fetch("http://localhost:8080/api/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      throw new Error("Lỗi khi tạo hóa đơn");
    }

    const data = await response.json();
    alert(
      "Đặt hàng thành công! Vui lòng kiểm tra email để xem chi tiết hóa đơn."
    );
    hidePurchaseForm();
  } catch (error) {
    console.error("Error:", error);
    alert("Lỗi khi xử lý đơn hàng: " + error.message);
  }
}

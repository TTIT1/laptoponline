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

const formData = new FormData();
formData.append("file", file); // Replace 'file' with your actual file object
formData.append("upload_preset", "MinorProject"); // 🔹 Use your unsigned preset name here
formData.append("cloud_name", "drfnb7ltd"); // 🔹 Your Cloudinary cloud name

fetch("https://api.cloudinary.com/v1_1/drfnb7ltd/image/upload", {
  method: "POST",
  body: formData,
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Uploaded image URL:", data.secure_url);
  })
  .catch((err) => {
    console.error("Upload failed:", err);
  });

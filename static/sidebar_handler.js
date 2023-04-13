function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    const sidebarToggle = document.querySelector('.sidebar-toggle');
  
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  
    if (sidebar.classList.contains("collapsed")) {
      sidebarToggle.style.left = '0';
    } else {
      sidebarToggle.style.left = '250px';
    }
  }
  
  
  function navigate(pageId, title) {
    const pages = ['dashboard', 'groups', 'rules'];
    
    pages.forEach(page => {
      const pageElement = document.getElementById(page);
      
      if (page === pageId) {
        pageElement.style.display = 'block';
      } else {
        pageElement.style.display = 'none';
      }
    });
  
    // Update the page title if a new title is provided
    if (title) {
      document.querySelector("h1.page-title").textContent = title;
    }

     // If navigating back to the Dashboard, show all devices
  if (pageId==='dashboard' && title === 'Dashboard') {
    const allDevices = document.querySelectorAll(".device-box");
    allDevices.forEach((device) => {
      device.style.display = "block";
    });
  }
}

    
  
  
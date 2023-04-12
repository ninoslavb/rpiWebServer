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
  
  
  function navigate(pageId) {
    const pages = ['dashboard', 'groups', 'if-this-then-this'];
    
    pages.forEach(page => {
      const pageElement = document.getElementById(page);
      
      if (page === pageId) {
        pageElement.style.display = 'block';
      } else {
        pageElement.style.display = 'none';
      }
    });
  }
  
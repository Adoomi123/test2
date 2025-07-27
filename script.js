// 🌙 Theme Toggle (unchanged)
function toggleTheme() {
  const body = document.body;
  body.classList.toggle("light");
  localStorage.setItem("theme", body.classList.contains("light") ? "light" : "dark");
}
window.addEventListener("load", () => {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
});

// Fetch Instagram stats from RapidAPI
async function fetchInstagramStats(username) {
  const apiUrl = `https://instagram-statistics-api.p.rapidapi.com/community?url=https://www.instagram.com/${encodeURIComponent(username)}/`;

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '55f77ff747msh38b57aee953e8f7p1458d9jsnc6e7dae43edf',
      'X-RapidAPI-Host': 'instagram-statistics-api.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(apiUrl, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API returned error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    console.log('API data:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch Instagram data:', error.message);
    alert('Failed to fetch Instagram data: ' + error.message);
    return null;
  }
}

// Triggered when clicking the button on home page
async function goToStats() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Enter a username.");
    return;
  }

  const result = await fetchInstagramStats(username);
  if (!result || !result.data) return;

  const user = result.data;

  // Map API response to local storage format
  const igStats = {
    username: user.username || username,
    full_name: user.full_name || "N/A",
    profile_pic_url: user.profile_pic_url || "https://via.placeholder.com/150",
    biography: user.biography || "No bio available.",
    followers: user.follower_count || 0,
    following: user.following_count || 0,
    posts: user.media_count || 0,
    reels: 0,
    growth7: Array(7).fill(user.follower_count || 0),  // Placeholder
    growth30: Array(30).fill(user.follower_count || 0) // Placeholder
  };

  localStorage.setItem("igStats", JSON.stringify(igStats));
  window.location.href = "stats.html";
}

// Chart loading code for stats page
function loadChart(type, days) {
  const stats = JSON.parse(localStorage.getItem("igStats") || "{}");
  if (!stats.username) return;

  document.querySelectorAll(".range-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".range-btn").forEach(btn => {
    if (btn.textContent.includes(days)) {
      btn.classList.add("active");
    }
  });

  if (window.advancedChartInstance) {
    window.advancedChartInstance.destroy();
  }

  const ctxA = document.getElementById("advancedChart").getContext("2d");
  window.advancedChartInstance = new Chart(ctxA, {
    type: "line",
    data: {
      labels: Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
      datasets: [{
        label: `Followers (${days}d)`,
        data: stats[`growth${days}`],
        borderColor: "#28a745",
        fill: false
      }]
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const stats = JSON.parse(localStorage.getItem("igStats") || "{}");

  if (path.includes("stats.html") && stats.username) {
    document.getElementById("user-handle").textContent = `@${stats.username}`;
    document.getElementById("profile-pic").src = stats.profile_pic_url;
    document.getElementById("display-name").textContent = stats.full_name;
    document.getElementById("bio").textContent = stats.biography;
    document.getElementById("followers").textContent = stats.followers.toLocaleString();
    document.getElementById("following").textContent = stats.following.toLocaleString();
    document.getElementById("posts").textContent = stats.posts.toLocaleString();
    document.getElementById("reels").textContent = stats.reels.toLocaleString();

    const ctx = document.getElementById("followersChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["6d", "5d", "4d", "3d", "2d", "Yesterday", "Today"],
        datasets: [{
          label: "Followers",
          data: stats.growth7,
          borderColor: "#ff2d55",
          fill: false
        }]
      }
    });
  }

  if (path.includes("advanced.html") && stats.username) {
    loadChart("followers", 7);

    const ctxB = document.getElementById("multiChart").getContext("2d");
    new Chart(ctxB, {
      type: "bar",
      data: {
        labels: ["Posts", "Reels"],
        datasets: [{
          label: "Count",
          data: [stats.posts, stats.reels],
          backgroundColor: ["#007bff", "#ff2d55"]
        }]
      }
    });

    document.querySelectorAll(".range-btn").forEach(button => {
      button.addEventListener("click", () => {
        const days = button.textContent.includes("7") ? 7 : 30;
        loadChart("followers", days);
      });
    });
  }
});

const API_BASE = {
  user:
    (process.env.REACT_APP_USER_SERVICE_URL || "http://localhost:3001") +
    "/api/users",
  course:
    (process.env.REACT_APP_COURSE_SERVICE_URL || "http://localhost:3002") +
    "/api/courses",
  progress:
    (process.env.REACT_APP_PROGRESS_SERVICE_URL || "http://localhost:3003") +
    "/api/progress",
};

// Helper function for API calls with JWT token
const apiCall = async (method, url, data = null) => {
  const token = localStorage.getItem("token");

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data && (method === "POST" || method === "PUT")) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

// AUTH FUNCTIONS
export const login = async (email, password) => {
  const data = await apiCall("POST", `${API_BASE.user}/login`, {
    email,
    password,
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};

export const register = async (email, password, firstName, lastName) => {
  const data = await apiCall("POST", `${API_BASE.user}/register`, {
    email,
    password,
    firstName,
    lastName,
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// COURSE FUNCTIONS
export const getCourses = () => apiCall("GET", `${API_BASE.course}`);

export const getCourse = (id) => apiCall("GET", `${API_BASE.course}/${id}`);

export const enrollInCourse = (courseId) =>
  apiCall("POST", `${API_BASE.course}/${courseId}/enroll`);

// QUIZ FUNCTIONS
export const getCourseQuizzes = (courseId) =>
  apiCall("GET", `${API_BASE.course}/${courseId}/quizzes`);

export const getQuiz = (courseId, quizId) =>
  apiCall("GET", `${API_BASE.course}/${courseId}/quizzes/${quizId}`);

export const submitQuiz = (courseId, quizId, answers) =>
  apiCall("POST", `${API_BASE.course}/${courseId}/quizzes/${quizId}/submit`, {
    answers,
  });

// PROGRESS FUNCTIONS
export const getUserProgress = (userId) =>
  apiCall("GET", `${API_BASE.progress}/user/${userId}`);

export const updateProgress = (progressData) =>
  apiCall("POST", `${API_BASE.progress}`, progressData);

// RESOURCE FUNCTIONS
export const getCourseResources = (courseId) =>
  apiCall("GET", `${API_BASE.course}/${courseId}/resources`);

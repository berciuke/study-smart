const axios = require('axios');

const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3002';

class CourseService {
  async getCourseById(courseId) {
    try {
      const response = await axios.get(`${COURSE_SERVICE_URL}/api/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('[CourseService] getCourseById error:', error.response?.data || error.message);
      throw new Error('Błąd pobierania danych kursu');
    }
  }

  async getEnrollment(userId, courseId) {
    try {
      const response = await axios.get(`${COURSE_SERVICE_URL}/api/courses/${courseId}`);
      const course = response.data;
      
      console.log(`[DEBUG] getEnrollment: userId=${userId}, courseId=${courseId}`);
      console.log(`[DEBUG] course.enrollments:`, course.enrollments);
      
      if (!course || !course.enrollments) {
        console.log('[DEBUG] No course or enrollments found');
        return null;
      }
      
      const enrollment = course.enrollments.find(e => e.userId === parseInt(userId));
      console.log(`[DEBUG] Found enrollment:`, enrollment);
      return enrollment;
    } catch (error) {
      console.error('[CourseService] getEnrollment error:', error.response?.data || error.message);
      return null; 
    }
  }

  async getAllCourses() {
    try {
      const response = await axios.get(`${COURSE_SERVICE_URL}/api/courses`);
      return response.data.courses || [];
    } catch (error) {
      console.error('[CourseService] getAllCourses error:', error.response?.data || error.message);
      throw new Error('Błąd pobierania listy kursów');
    }
  }
}

module.exports = new CourseService(); 
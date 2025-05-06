import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faSearch, 
  faLightbulb, 
  faShieldAlt,
  faUsers,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-content">
        <div className="about-header">
          <h1>About RAE</h1>
          <p className="tagline">Research Assistant Enhanced - Your AI-Powered Research Companion</p>
        </div>

        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At RAE, we are dedicated to revolutionizing the research experience through artificial intelligence. 
            Our mission is to empower researchers, students, and academics with cutting-edge AI tools that 
            streamline the research process, enhance understanding, and foster innovation.
          </p>
        </section>

        <section className="features-section">
          <h2>What Makes RAE Special</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FontAwesomeIcon icon={faRobot} className="feature-icon" />
              <h3>Advanced AI Technology</h3>
              <p>Powered by state-of-the-art language models to provide accurate and contextual research assistance.</p>
            </div>
            <div className="feature-card">
              <FontAwesomeIcon icon={faSearch} className="feature-icon" />
              <h3>Smart Search</h3>
              <p>Intelligent search capabilities that understand context and research requirements.</p>
            </div>
            <div className="feature-card">
              <FontAwesomeIcon icon={faLightbulb} className="feature-icon" />
              <h3>Research Insights</h3>
              <p>Generate valuable insights and connections across different research papers and topics.</p>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <h2>Benefits of Using RAE</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <FontAwesomeIcon icon={faChartLine} className="benefit-icon" />
              <div className="benefit-content">
                <h3>Enhanced Productivity</h3>
                <p>Save hours of research time with automated literature review and paper summarization.</p>
              </div>
            </div>
            <div className="benefit-item">
              <FontAwesomeIcon icon={faUsers} className="benefit-icon" />
              <div className="benefit-content">
                <h3>Collaborative Research</h3>
                <p>Share insights and findings easily with team members and research collaborators.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2>Get in Touch</h2>
          <p>
            Have questions about RAE? We would love to hear from you! Contact our team at{' '}
            <a href="mailto:support@rae-assistant.com">support@rae-assistant.com</a>
          </p>
        </section>

        <footer className="about-footer">
          <p>© 2024 RAE Assistant. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
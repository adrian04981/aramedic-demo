import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-container">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="logo">
            <h1>Clínica AraMedic</h1>
            <span class="tagline">Tu belleza, nuestra pasión</span>
          </div>
          <nav class="nav">
            <a href="#nosotros" class="nav-link">Nosotros</a>
            <a href="#servicios" class="nav-link">Tratamientos</a>
            <a href="#especialistas" class="nav-link">Especialistas</a>
            <a href="#contacto" class="nav-link">Contacto</a>
            <button class="btn btn-outline" (click)="goToLogin()">Portal Médico</button>
          </nav>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h2>Transforma tu Belleza con Nosotros</h2>
              <p>En Clínica AraMedic ofrecemos los mejores tratamientos estéticos con más de 15 años de experiencia. 
                 Contamos con cirujanos plásticos certificados y tecnología de última generación para realzar tu belleza natural.</p>
              <div class="hero-stats">
                <div class="stat">
                  <span class="stat-number">15+</span>
                  <span class="stat-label">Años de experiencia</span>
                </div>
                <div class="stat">
                  <span class="stat-number">12</span>
                  <span class="stat-label">Especialistas certificados</span>
                </div>
                <div class="stat">
                  <span class="stat-number">5000+</span>
                  <span class="stat-label">Procedimientos exitosos</span>
                </div>
              </div>
              <div class="hero-buttons">
                <button class="btn btn-primary" (click)="contactWhatsApp()">
                  <span class="whatsapp-icon">📱</span>
                  Cotizar por WhatsApp
                </button>
                <button class="btn btn-secondary" (click)="scrollToSection('servicios')">
                  Ver Tratamientos
                </button>
              </div>
            </div>
            <div class="hero-image">
              <div class="beauty-icon">
                <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
                  <circle cx="150" cy="150" r="120" fill="#fff5f7" stroke="#ec4899" stroke-width="2"/>
                  <path d="M150 100c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50z" fill="#fce7f3"/>
                  <circle cx="150" cy="150" r="40" fill="#ec4899" opacity="0.3"/>
                  <path d="M120 130c0-5 4-9 9-9s9 4 9 9M162 130c0-5 4-9 9-9s9 4 9 9" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>
                  <path d="M135 170c8 8 22 8 30 0" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Nosotros Section -->
      <section class="nosotros" id="nosotros">
        <div class="container">
          <div class="nosotros-content">
            <div class="nosotros-text">
              <h3>Nosotros</h3>
              <h4>Especialistas en Cirugía Estética desde 2009</h4>
              <p>Clínica AraMedic es líder en cirugía plástica y tratamientos estéticos en Perú. 
                 Contamos con un equipo de cirujanos plásticos certificados y especializados en procedimientos como 
                 liposucción, abdominoplastia, aumento de mama, rinoplastia y más. Nuestro compromiso es realzar 
                 tu belleza natural con resultados excepcionales y seguros.</p>
              
              <div class="nosotros-features">
                <div class="feature">
                  <span class="icon">🏆</span>
                  <div>
                    <h5>Cirujanos Certificados</h5>
                    <p>Especialistas con certificación internacional</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="icon">💎</span>
                  <div>
                    <h5>Tecnología de Vanguardia</h5>
                    <p>Equipos y técnicas de última generación</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="icon">❤️</span>
                  <div>
                    <h5>Atención Personalizada</h5>
                    <p>Cuidado integral en cada paso del proceso</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="nosotros-image">
              <div class="stats-card">
                <h5>Nuestros Números</h5>
                <div class="stats">
                  <div class="stat-item">
                    <span class="number">15+</span>
                    <span class="label">Años de experiencia</span>
                  </div>
                  <div class="stat-item">
                    <span class="number">12</span>
                    <span class="label">Cirujanos Plásticos</span>
                  </div>
                  <div class="stat-item">
                    <span class="number">5K+</span>
                    <span class="label">Cirugías exitosas</span>
                  </div>
                  <div class="stat-item">
                    <span class="number">98%</span>
                    <span class="label">Satisfacción</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Servicios Section -->
      <section class="servicios" id="servicios">
        <div class="container">
          <div class="section-header">
            <h3>Nuestros Tratamientos</h3>
            <p>Procedimientos estéticos de vanguardia para realzar tu belleza natural</p>
          </div>
          <div class="servicios-grid">
            <div class="servicio-card">
              <div class="servicio-icon">💃</div>
              <h4>Liposucción</h4>
              <p>Elimina grasa localizada y esculpe tu silueta con técnicas de liposucción de última generación.</p>
              <ul>
                <li>Liposucción HD</li>
                <li>Lipoescultura 360°</li>
                <li>Liposucción láser</li>
                <li>Resultados naturales</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">✨</div>
              <h4>Abdominoplastia</h4>
              <p>Recupera un abdomen firme y tonificado eliminando exceso de piel y grasa abdominal.</p>
              <ul>
                <li>Abdominoplastia completa</li>
                <li>Mini abdominoplastia</li>
                <li>Reparación de diástasis</li>
                <li>Recuperación rápida</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">💎</div>
              <h4>Aumento de Mamas</h4>
              <p>Aumenta y mejora la forma de tus senos con implantes de última generación.</p>
              <ul>
                <li>Implantes anatómicos</li>
                <li>Implantes redondos</li>
                <li>Prótesis de cohesivo</li>
                <li>Técnicas mínimamente invasivas</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">👃</div>
              <h4>Rinoplastia</h4>
              <p>Perfecciona la armonía facial con cirugía de nariz personalizada a tus rasgos.</p>
              <ul>
                <li>Rinoplastia estética</li>
                <li>Rinoplastia funcional</li>
                <li>Rinoseptoplastia</li>
                <li>Técnica abierta y cerrada</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">🍑</div>
              <h4>Levantamiento Glúteo</h4>
              <p>Realza y moldea tus glúteos con lipotransferencia o implantes de última generación.</p>
              <ul>
                <li>Brazilian Butt Lift (BBL)</li>
                <li>Implantes glúteos</li>
                <li>Levantamiento con hilos</li>
                <li>Resultados duraderos</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">🌟</div>
              <h4>Rejuvenecimiento Facial</h4>
              <p>Recupera una apariencia juvenil con procedimientos de rejuvenecimiento facial avanzados.</p>
              <ul>
                <li>Lifting facial</li>
                <li>Blefaroplastia (párpados)</li>
                <li>Rellenos faciales</li>
                <li>Toxina botulínica</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Especialistas Section -->
      <section class="especialistas" id="especialistas">
        <div class="container">
          <div class="section-header">
            <h3>Nuestros Especialistas</h3>
            <p>Cirujanos plásticos certificados con amplia experiencia internacional</p>
          </div>
          <div class="especialistas-grid">
            <div class="doctor-card">
              <div class="doctor-image">
                <div class="avatar">👨‍⚕️</div>
              </div>
              <div class="doctor-info">
                <h4>Dr. Ricardo Mendoza</h4>
                <span class="specialty">Cirujano Plástico</span>
                <p>Especialista en cirugía estética corporal con 18 años de experiencia. Certificado por la Sociedad Peruana de Cirugía Plástica.</p>
                <div class="credentials">
                  <span>📍 Lima, Perú</span>
                  <span>📅 Lun-Vie 9:00-18:00</span>
                </div>
              </div>
            </div>
            <div class="doctor-card">
              <div class="doctor-image">
                <div class="avatar">👩‍⚕️</div>
              </div>
              <div class="doctor-info">
                <h4>Dra. Patricia Silva</h4>
                <span class="specialty">Cirujana Plástica</span>
                <p>Experta en rejuvenecimiento facial y aumento mamario. Formación en Estados Unidos y Brasil.</p>
                <div class="credentials">
                  <span>📍 Lima, Perú</span>
                  <span>📅 Mar-Sáb 10:00-19:00</span>
                </div>
              </div>
            </div>
            <div class="doctor-card">
              <div class="doctor-image">
                <div class="avatar">👨‍⚕️</div>
              </div>
              <div class="doctor-info">
                <h4>Dr. Javier Torres</h4>
                <span class="specialty">Cirujano Plástico</span>
                <p>Especialista en liposucción HD y contorno corporal. Miembro de la International Society of Aesthetic Plastic Surgery (ISAPS).</p>
                <div class="credentials">
                  <span>📍 Lima, Perú</span>
                  <span>📅 Lun-Jue 8:00-17:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contacto Section -->
      <section class="contacto" id="contacto">
        <div class="container">
          <div class="contacto-content">
            <div class="contacto-info">
              <h3>Contacto</h3>
              <p>Estamos aquí para ayudarte a alcanzar la belleza que deseas. Contáctanos para tu consulta personalizada.</p>
              
              <div class="contact-details">
                <div class="contact-item">
                  <span class="icon">📍</span>
                  <div>
                    <h5>Dirección</h5>
                    <p>Av. Javier Prado Este 1234<br>San Isidro, Lima - Perú</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">�</span>
                  <div>
                    <h5>WhatsApp</h5>
                    <p>+51 966 401 791<br>Respuesta inmediata</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">⏰</span>
                  <div>
                    <h5>Horarios</h5>
                    <p>Lunes a Viernes: 9:00 AM - 7:00 PM<br>
                       Sábados: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">✉️</span>
                  <div>
                    <h5>Email</h5>
                    <p>contacto@clinica-aramedic.pe<br>info@clinica-aramedic.pe</p>
                  </div>
                </div>
              </div>

              <div class="whatsapp-cta">
                <h4>� Cotiza tu procedimiento</h4>
                <p>Chatea con nosotros por WhatsApp y recibe una cotización personalizada en minutos</p>
                <button class="btn btn-whatsapp" (click)="contactWhatsApp()">
                  <span class="whatsapp-icon">📱</span>
                  Iniciar Chat en WhatsApp
                </button>
              </div>
            </div>
            
            <div class="cita-form">
              <div class="form-card">
                <h4>Agenda tu Consulta</h4>
                <p>Completa el formulario y nos contactaremos contigo</p>
                
                <form class="appointment-form" (ngSubmit)="onAppointmentSubmit($event)">
                  <div class="form-group">
                    <input type="text" placeholder="Nombre completo" required>
                  </div>
                  <div class="form-group">
                    <input type="tel" placeholder="Teléfono / WhatsApp" required>
                  </div>
                  <div class="form-group">
                    <input type="email" placeholder="Correo electrónico" required>
                  </div>
                  <div class="form-group">
                    <select required>
                      <option value="">Selecciona procedimiento</option>
                      <option value="liposuccion">Liposucción</option>
                      <option value="abdominoplastia">Abdominoplastia</option>
                      <option value="aumento-mamas">Aumento de Mamas</option>
                      <option value="rinoplastia">Rinoplastia</option>
                      <option value="gluteos">Levantamiento Glúteo</option>
                      <option value="facial">Rejuvenecimiento Facial</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <textarea placeholder="Cuéntanos sobre tus expectativas (opcional)" rows="3"></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-full">
                    Solicitar Consulta
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <div class="footer-logo">
                <h4>✨ Clínica AraMedic</h4>
                <p>Tu belleza, nuestra pasión desde 2009</p>
              </div>
              <div class="social-links">
                <span>Síguenos en:</span>
                <div class="social-icons">
                  <a href="#" class="social-icon">📘</a>
                  <a href="#" class="social-icon">📷</a>
                  <a href="#" class="social-icon">🐦</a>
                </div>
              </div>
            </div>
            
            <div class="footer-section">
              <h5>Tratamientos</h5>
              <ul>
                <li><a href="#servicios">Liposucción</a></li>
                <li><a href="#servicios">Abdominoplastia</a></li>
                <li><a href="#servicios">Aumento de Mamas</a></li>
                <li><a href="#servicios">Rinoplastia</a></li>
                <li><a href="#servicios">Levantamiento Glúteo</a></li>
                <li><a href="#servicios">Rejuvenecimiento Facial</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h5>Enlaces</h5>
              <ul>
                <li><a href="#nosotros">Nosotros</a></li>
                <li><a href="#especialistas">Especialistas</a></li>
                <li><a href="#contacto">Contacto</a></li>
                <li><a href="#" (click)="goToLogin()">Portal Médico</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h5>Contacto</h5>
              <ul>
                <li>📍 San Isidro, Lima - Perú</li>
                <li>� +51 966 401 791 (WhatsApp)</li>
                <li>✉️ contacto@clinica-aramedic.pe</li>
                <li>⏰ Lun-Vie: 9:00 AM - 7:00 PM</li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; 2024 Clínica AraMedic Perú. Todos los derechos reservados.</p>
            <div class="footer-links">
              <a href="#">Política de Privacidad</a>
              <a href="#">Términos y Condiciones</a>
              <a href="#">Libro de Reclamaciones</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      background: #ffffff;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Header */
    .header {
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo h1 {
      color: #ec4899;
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .tagline {
      color: #ec4899;
      font-size: 0.9rem;
      font-style: italic;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-link {
      color: #374151;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .nav-link:hover {
      color: #ec4899;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%);
      color: white;
      padding: 6rem 0;
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero h2 {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
    }
    
    .whatsapp-icon {
      font-size: 1.2rem;
      margin-right: 0.5rem;
    }

    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin: 2rem 0;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: #fbbf24;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    /* Nosotros Section */
    .nosotros {
      padding: 6rem 0;
      background: #f8fafc;
    }

    .nosotros-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .nosotros h3 {
      color: #2563eb;
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .nosotros h4 {
      color: #1f2937;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .nosotros p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .nosotros-features {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .feature .icon {
      font-size: 2rem;
    }

    .feature h5 {
      color: #1f2937;
      margin: 0 0 0.25rem 0;
      font-weight: 600;
    }

    .feature p {
      color: #6b7280;
      margin: 0;
      font-size: 0.9rem;
    }

    .stats-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .stats-card h5 {
      color: #1f2937;
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 1.2rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-item .number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #2563eb;
    }

    .stat-item .label {
      font-size: 0.85rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    /* Servicios Section */
    .servicios {
      padding: 6rem 0;
      background: white;
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-header h3 {
      color: #1f2937;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .section-header p {
      color: #6b7280;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .servicios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .servicio-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-top: 4px solid #2563eb;
    }

    .servicio-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .servicio-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .servicio-card h4 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .servicio-card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .servicio-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .servicio-card li {
      color: #374151;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      align-items: center;
    }

    .servicio-card li:before {
      content: "✓";
      color: #10b981;
      font-weight: bold;
      margin-right: 0.5rem;
    }

    /* Especialistas Section */
    .especialistas {
      padding: 6rem 0;
      background: #f8fafc;
    }

    .especialistas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .doctor-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .doctor-card:hover {
      transform: translateY(-5px);
    }

    .doctor-image {
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
      padding: 2rem;
      text-align: center;
    }

    .avatar {
      font-size: 4rem;
      display: inline-block;
      background: white;
      border-radius: 50%;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .doctor-info {
      padding: 1.5rem;
    }

    .doctor-info h4 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .specialty {
      color: #ec4899;
      font-weight: 600;
      margin-bottom: 1rem;
      display: block;
    }

    .doctor-info p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .credentials {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .credentials span {
      color: #374151;
      font-size: 0.9rem;
    }

    /* Contacto Section */
    .contacto {
      padding: 6rem 0;
      background: white;
    }

    .contacto-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    }

    .contacto h3 {
      color: #1f2937;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .contacto p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .contact-item .icon {
      font-size: 1.5rem;
      margin-top: 0.25rem;
    }

    .contact-item h5 {
      color: #1f2937;
      margin: 0 0 0.25rem 0;
      font-weight: 600;
    }

    .contact-item p {
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }

    .whatsapp-cta {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-top: 2rem;
    }

    .whatsapp-cta h4 {
      color: white;
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
    }

    .whatsapp-cta p {
      color: white;
      margin: 0 0 1rem 0;
      opacity: 0.95;
    }

    .btn-whatsapp {
      background: white;
      color: #25D366;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-whatsapp:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3);
    }

    .form-card {
      background: #f8fafc;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .form-card h4 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-size: 1.3rem;
    }

    .form-card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .appointment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #ec4899;
      box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
    }

    /* Buttons */
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: #ec4899;
      color: white;
    }

    .btn-primary:hover {
      background: #db2777;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background: white;
      color: #ec4899;
    }

    .btn-outline {
      background: transparent;
      color: #ec4899;
      border: 2px solid #ec4899;
    }

    .btn-outline:hover {
      background: #ec4899;
      color: white;
    }

    .btn-full {
      width: 100%;
    }

    /* Footer */
    .footer {
      background: #1f2937;
      color: white;
      padding: 3rem 0 1rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h4,
    .footer-section h5 {
      margin-bottom: 1rem;
      color: white;
    }

    .footer-section p {
      color: #9ca3af;
      margin: 0;
      line-height: 1.6;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section li {
      margin-bottom: 0.5rem;
    }

    .footer-section a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section a:hover {
      color: white;
    }

    .social-links {
      margin-top: 1rem;
    }

    .social-links span {
      color: #9ca3af;
      display: block;
      margin-bottom: 0.5rem;
    }

    .social-icons {
      display: flex;
      gap: 1rem;
    }

    .social-icon {
      font-size: 1.5rem;
      transition: transform 0.3s ease;
    }

    .social-icon:hover {
      transform: scale(1.2);
    }

    .footer-bottom {
      border-top: 1px solid #374151;
      padding-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-bottom p {
      color: #9ca3af;
      margin: 0;
    }

    .footer-links {
      display: flex;
      gap: 2rem;
    }

    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .footer-links a:hover {
      color: white;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-content,
      .nosotros-content,
      .contacto-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .hero h2 {
        font-size: 2rem;
      }

      .hero-stats {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .servicios-grid {
        grid-template-columns: 1fr;
      }

      .especialistas-grid {
        grid-template-columns: 1fr;
      }

      .footer-content {
        grid-template-columns: repeat(2, 1fr);
      }

      .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .nav {
        display: none;
      }

      .hero-buttons {
        flex-direction: column;
        gap: 1rem;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        grid-template-columns: 1fr;
      }

      .footer-links {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  contactWhatsApp() {
    // Número de WhatsApp para Perú
    const phoneNumber = '51966401791';
    const message = encodeURIComponent('Hola, me gustaría recibir información sobre los procedimientos estéticos de Clínica AraMedic.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  onAppointmentSubmit(event: Event) {
    event.preventDefault();
    // Redirigir a WhatsApp al enviar el formulario
    alert('¡Gracias por tu interés! Te redirigiremos a WhatsApp para finalizar tu solicitud.');
    this.contactWhatsApp();
  }
}
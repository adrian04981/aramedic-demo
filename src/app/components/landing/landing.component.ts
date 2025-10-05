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
            <span class="tagline">Tu salud, nuestra prioridad</span>
          </div>
          <nav class="nav">
            <a href="#nosotros" class="nav-link">Nosotros</a>
            <a href="#servicios" class="nav-link">Servicios</a>
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
              <h2>Atención Médica de Excelencia</h2>
              <p>En Clínica AraMedic brindamos servicios médicos integrales con más de 15 años de experiencia. 
                 Contamos con especialistas altamente capacitados y tecnología de vanguardia para cuidar tu salud.</p>
              <div class="hero-stats">
                <div class="stat">
                  <span class="stat-number">15+</span>
                  <span class="stat-label">Años de experiencia</span>
                </div>
                <div class="stat">
                  <span class="stat-number">25</span>
                  <span class="stat-label">Especialistas</span>
                </div>
                <div class="stat">
                  <span class="stat-number">10000+</span>
                  <span class="stat-label">Pacientes atendidos</span>
                </div>
              </div>
              <div class="hero-buttons">
                <button class="btn btn-primary" (click)="scrollToSection('contacto')">
                  Agendar Cita
                </button>
                <button class="btn btn-secondary" (click)="scrollToSection('servicios')">
                  Nuestros Servicios
                </button>
              </div>
            </div>
            <div class="hero-image">
              <div class="medical-icon">
                <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
                  <circle cx="150" cy="150" r="120" fill="#f0f9ff" stroke="#3b82f6" stroke-width="2"/>
                  <path d="M150 80v140M80 150h140" stroke="#3b82f6" stroke-width="8" stroke-linecap="round"/>
                  <circle cx="150" cy="150" r="30" fill="#3b82f6"/>
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
              <h4>Comprometidos con tu bienestar desde 2009</h4>
              <p>Clínica AraMedic nace con la misión de brindar atención médica integral y humanizada. 
                 Somos un equipo multidisciplinario de profesionales de la salud comprometidos con la excelencia 
                 en el servicio y la innovación constante.</p>
              
              <div class="nosotros-features">
                <div class="feature">
                  <span class="icon">🏆</span>
                  <div>
                    <h5>Excelencia Médica</h5>
                    <p>Especialistas certificados con formación continua</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="icon">�</span>
                  <div>
                    <h5>Tecnología Avanzada</h5>
                    <p>Equipos médicos de última generación</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="icon">❤️</span>
                  <div>
                    <h5>Atención Humanizada</h5>
                    <p>Cuidado integral centrado en el paciente</p>
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
                    <span class="number">25</span>
                    <span class="label">Especialistas</span>
                  </div>
                  <div class="stat-item">
                    <span class="number">10K+</span>
                    <span class="label">Pacientes satisfechos</span>
                  </div>
                  <div class="stat-item">
                    <span class="number">24/7</span>
                    <span class="label">Atención de urgencias</span>
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
            <h3>Nuestros Servicios</h3>
            <p>Ofrecemos una amplia gama de servicios médicos para cuidar tu salud integral</p>
          </div>
          <div class="servicios-grid">
            <div class="servicio-card">
              <div class="servicio-icon">🫀</div>
              <h4>Cardiología</h4>
              <p>Diagnóstico y tratamiento de enfermedades cardiovasculares con tecnología de vanguardia.</p>
              <ul>
                <li>Electrocardiogramas</li>
                <li>Ecocardiogramas</li>
                <li>Holter</li>
                <li>Consulta preventiva</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">🧠</div>
              <h4>Neurología</h4>
              <p>Atención especializada en trastornos del sistema nervioso central y periférico.</p>
              <ul>
                <li>Electroencefalogramas</li>
                <li>Tratamiento de migrañas</li>
                <li>Epilepsia</li>
                <li>Trastornos del sueño</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">🦴</div>
              <h4>Traumatología</h4>
              <p>Especialistas en lesiones musculoesqueléticas y cirugía ortopédica.</p>
              <ul>
                <li>Fracturas y lesiones</li>
                <li>Artroscopia</li>
                <li>Rehabilitación</li>
                <li>Medicina deportiva</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">�‍⚕️</div>
              <h4>Medicina Interna</h4>
              <p>Atención integral del adulto con enfoque preventivo y terapéutico.</p>
              <ul>
                <li>Chequeos preventivos</li>
                <li>Diabetes</li>
                <li>Hipertensión</li>
                <li>Control de crónicos</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">👩‍⚕️</div>
              <h4>Ginecología</h4>
              <p>Cuidado integral de la salud femenina en todas las etapas de la vida.</p>
              <ul>
                <li>Control ginecológico</li>
                <li>Planificación familiar</li>
                <li>Embarazo y parto</li>
                <li>Menopausia</li>
              </ul>
            </div>
            <div class="servicio-card">
              <div class="servicio-icon">👶</div>
              <h4>Pediatría</h4>
              <p>Atención especializada para bebés, niños y adolescentes hasta los 18 años.</p>
              <ul>
                <li>Control del niño sano</li>
                <li>Vacunación</li>
                <li>Desarrollo infantil</li>
                <li>Urgencias pediátricas</li>
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
            <p>Profesionales altamente calificados comprometidos con tu salud</p>
          </div>
          <div class="especialistas-grid">
            <div class="doctor-card">
              <div class="doctor-image">
                <div class="avatar">�‍⚕️</div>
              </div>
              <div class="doctor-info">
                <h4>Dr. Carlos Rodríguez</h4>
                <span class="specialty">Cardiólogo</span>
                <p>Especialista en cardiología con 20 años de experiencia. Miembro de la Sociedad Colombiana de Cardiología.</p>
                <div class="credentials">
                  <span>📍 Consultorio 201</span>
                  <span>📅 Lun-Vie 8:00-16:00</span>
                </div>
              </div>
            </div>
            <div class="doctor-card">
              <div class="doctor-image">
                <div class="avatar">👩‍⚕️</div>
              </div>
              <div class="doctor-info">
                <h4>Dra. María González</h4>
                <span class="specialty">Ginecóloga</span>
                <p>Especialista en ginecología y obstetricia. Experta en medicina materno-fetal y cirugía ginecológica.</p>
                <div class="credentials">
                  <span>📍 Consultorio 305</span>
                  <span>📅 Mar-Sáb 9:00-17:00</span>
                </div>
              </div>
            </div>
            <div class="doctor-card">
              <div class="doctor-image">
                <div class="avatar">👨‍⚕️</div>
              </div>
              <div class="doctor-info">
                <h4>Dr. Luis Martínez</h4>
                <span class="specialty">Neurólogo</span>
                <p>Neurólogo con subespecialidad en epilepsia. Formación en centros de excelencia internacional.</p>
                <div class="credentials">
                  <span>📍 Consultorio 102</span>
                  <span>📅 Lun-Jue 10:00-18:00</span>
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
              <p>Estamos aquí para cuidar tu salud. Contáctanos para agendar tu cita o resolver cualquier duda.</p>
              
              <div class="contact-details">
                <div class="contact-item">
                  <span class="icon">📍</span>
                  <div>
                    <h5>Dirección</h5>
                    <p>Calle 123 #45-67<br>Bogotá, Colombia</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">📞</span>
                  <div>
                    <h5>Teléfonos</h5>
                    <p>+57 (1) 234-5678<br>Urgencias: +57 300 123-4567</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">⏰</span>
                  <div>
                    <h5>Horarios</h5>
                    <p>Lunes a Viernes: 7:00 AM - 8:00 PM<br>
                       Sábados: 8:00 AM - 4:00 PM<br>
                       Urgencias: 24/7</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">✉️</span>
                  <div>
                    <h5>Email</h5>
                    <p>info@clinica-aramedic.com<br>citas@clinica-aramedic.com</p>
                  </div>
                </div>
              </div>

              <div class="emergency-notice">
                <h4>🚨 En caso de emergencia</h4>
                <p>Llama inmediatamente al <strong>+57 300 123-4567</strong> o dirígete a nuestro servicio de urgencias disponible las 24 horas.</p>
              </div>
            </div>
            
            <div class="cita-form">
              <div class="form-card">
                <h4>Agenda tu cita</h4>
                <p>Completa el formulario y nos contactaremos contigo</p>
                
                <form class="appointment-form" (ngSubmit)="onAppointmentSubmit($event)">
                  <div class="form-group">
                    <input type="text" placeholder="Nombre completo" required>
                  </div>
                  <div class="form-group">
                    <input type="tel" placeholder="Teléfono" required>
                  </div>
                  <div class="form-group">
                    <input type="email" placeholder="Correo electrónico" required>
                  </div>
                  <div class="form-group">
                    <select required>
                      <option value="">Selecciona especialidad</option>
                      <option value="cardiologia">Cardiología</option>
                      <option value="neurologia">Neurología</option>
                      <option value="traumatologia">Traumatología</option>
                      <option value="medicina-interna">Medicina Interna</option>
                      <option value="ginecologia">Ginecología</option>
                      <option value="pediatria">Pediatría</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <textarea placeholder="Motivo de la consulta (opcional)" rows="3"></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-full">
                    Solicitar Cita
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
                <h4>Clínica AraMedic</h4>
                <p>Tu salud, nuestra prioridad desde 2009</p>
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
              <h5>Servicios</h5>
              <ul>
                <li><a href="#servicios">Cardiología</a></li>
                <li><a href="#servicios">Neurología</a></li>
                <li><a href="#servicios">Traumatología</a></li>
                <li><a href="#servicios">Medicina Interna</a></li>
                <li><a href="#servicios">Ginecología</a></li>
                <li><a href="#servicios">Pediatría</a></li>
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
                <li>📍 Calle 123 #45-67, Bogotá</li>
                <li>📞 +57 (1) 234-5678</li>
                <li>✉️ info@clinica-aramedic.com</li>
                <li>🚨 Urgencias: +57 300 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; 2024 Clínica AraMedic. Todos los derechos reservados.</p>
            <div class="footer-links">
              <a href="#">Política de Privacidad</a>
              <a href="#">Términos y Condiciones</a>
              <a href="#">PQRS</a>
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
      color: #2563eb;
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .tagline {
      color: #6b7280;
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
      color: #2563eb;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      color: #2563eb;
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

    .emergency-notice {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .emergency-notice h4 {
      color: #dc2626;
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .emergency-notice p {
      color: #7f1d1d;
      margin: 0;
      font-size: 0.9rem;
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
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background: white;
      color: #2563eb;
    }

    .btn-outline {
      background: transparent;
      color: #2563eb;
      border: 2px solid #2563eb;
    }

    .btn-outline:hover {
      background: #2563eb;
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

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  onAppointmentSubmit(event: Event) {
    event.preventDefault();
    // Aquí podrías agregar la lógica para enviar el formulario
    alert('Gracias por su solicitud. Nos comunicaremos con usted pronto.');
  }
}
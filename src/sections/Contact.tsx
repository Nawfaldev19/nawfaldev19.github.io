import { Clock } from '../components/Clock';
import { CopyEmail } from '../components/CopyEmail';
import { SectionHead } from '../components/SectionHead';
import { FAQ, LINKS } from '../content/site';

export function Contact() {
  return (
    <section id="contact" className="section page" aria-labelledby="faq-title">
      <SectionHead code="S.06" label="FAQ · contact" id="faq-title">
        Questions recruiters ask
      </SectionHead>

      <div className="faq">
        {FAQ.map((f) => (
          <details key={f.q} className="faq__item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>

      <div className="contact" data-reveal>
        <h3 className="contact__title">Get in touch</h3>
        <p className="contact__line">Open to remote roles. Email is the fastest way to reach me.</p>
        <div className="actions">
          <CopyEmail />
          <a className="btn btn--plain" href={LINKS.linkedin} rel="me noopener" target="_blank">
            LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <a className="btn btn--plain" href={LINKS.github} rel="me noopener" target="_blank">
            GitHub<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="contact__clock">
          <Clock className="mono-label" />
          <span className="mono-label"> · UTC+5</span>
        </p>
      </div>
    </section>
  );
}

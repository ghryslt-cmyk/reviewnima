import { Mail, Play, Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';

const Contact = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const cards = [
    {
      icon: Mail,
      gradient: 'from-blue-600 to-cyan-500',
      title: t('contact.email'),
      value: 'morvissenter@gmail.com',
      href: 'mailto:morvissenter@gmail.com',
      desc: t('contact.emailDesc') || 'Untuk laporan bug, saran, atau kerja sama.',
    },
    {
      icon: Play,
      gradient: 'from-red-500 to-red-600',
      title: t('contact.socialMedia'),
      value: 'Morviss',
      href: 'https://www.youtube.com/@Morviss09',
      desc: t('contact.socialDesc') || 'Channel YouTube resmi ReviewNima.',
    },
  ];

  return (
    <Layout>
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white pb-16 dark:from-brand-900/40 dark:to-transparent">
        <div className="mx-auto max-w-4xl px-4 pt-12 sm:pt-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-glow">
              <Sparkles size={14} />
              {t('contact.eyebrow') || 'Hubungi Kami'}
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl md:text-6xl">
              <span className="text-gradient-static">{t('contact.title')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {cards.map(({ icon: Icon, gradient, title, value, href, desc }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="card-hover group rounded-2xl border border-gray-200/70 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900"
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                  <Icon size={22} />
                </span>
                <h3 className="font-display mt-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 font-semibold text-brand-600 dark:text-brand-300">{value}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-400 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
                  {t('contact.reachUs') || 'Hubungi'} <ArrowUpRight size={15} />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-6 text-center dark:border-brand-500/20 dark:bg-brand-500/5">
            <p className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Heart size={16} className="text-sky-500" fill="currentColor" />
              {t('contact.footerNote') || 'Terima kasih sudah mendukung ReviewNima. Setiap masukan sangat berarti untuk membuat website ini lebih baik.'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;

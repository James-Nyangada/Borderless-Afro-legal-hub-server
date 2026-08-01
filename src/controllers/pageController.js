const Page = require('../models/Page');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Default pages structure to seed if missing
const DEFAULT_PAGES = [
  {
    identifier: 'about',
    title: 'About Us',
    content: {
      mission: 'To provide accessible legal services across borders.',
      vision: 'A borderless Africa where legal support is seamless.',
      about_us: 'We are a dedicated team of legal professionals...'
    }
  },
  {
    identifier: 'services',
    title: 'Services',
    content: {
      services: [
        {
          title: 'Consultation',
          description: 'One-on-one legal consultation.'
        }
      ]
    }
  },
  {
    identifier: 'faq',
    title: 'FAQ',
    content: {
      subtitle: 'Find answers to common questions about our legal services, consultations, and platform.',
      faqs: [
        {
          question: 'How do I schedule a consultation?',
          answer: 'You can schedule a consultation by filling out the contact form.'
        }
      ]
    }
  },
  {
    identifier: 'privacy-policy',
    title: 'Privacy Policy',
    content: {
      text: '<p>Our privacy policy...</p>'
    }
  },
  {
    identifier: 'contact',
    title: 'Contact Us',
    content: {
      email: 'consult@borderlessafro.com',
      phone: '+254 700 000 000',
      socialLinks: [
        { platform: 'WhatsApp', url: 'https://wa.me/1234567890' },
        { platform: 'Facebook', url: 'https://facebook.com' }
      ]
    }
  }
];

exports.getPages = catchAsync(async (req, res, next) => {
  // Try to seed missing default pages automatically
  for (const defaultPage of DEFAULT_PAGES) {
    const exists = await Page.findOne({ identifier: defaultPage.identifier });
    if (!exists) {
      await Page.create(defaultPage);
    }
  }

  const pages = await Page.find().sort({ createdAt: 1 }); // Sort by creation to keep order consistent

  res.status(200).json({
    status: 'success',
    results: pages.length,
    data: {
      pages
    }
  });
});

exports.getPageByIdentifier = catchAsync(async (req, res, next) => {
  const page = await Page.findOne({ identifier: req.params.identifier });

  if (!page) {
    return next(new AppError('No page found with that identifier', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      page
    }
  });
});

exports.updatePage = catchAsync(async (req, res, next) => {
  const page = await Page.findOneAndUpdate(
    { identifier: req.params.identifier },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!page) {
    return next(new AppError('No page found with that identifier', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      page
    }
  });
});

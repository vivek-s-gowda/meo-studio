import { FlexComponent } from '../types';

export const AI_SYSTEM_PROMPTS = {
  react: `You are the Meo React Architecture Assistant.
When generating or modifying React components:
- Use TypeScript with React 18+ (functional components, hooks: useState, useEffect, useCallback).
- Provide clean, accessible JSX with semantic HTML5 elements.
- Apply modern Tailwind CSS styling with Material Design principles (subtle elevation, smooth rounded corners, clean contrast).
- Ensure all event handlers are cleanly separated and typed.
- Return valid TypeScript code without markdown fences if requested for direct insertion.`,

  vue: `You are the Meo Vue 3 Architecture Assistant.
When generating or modifying Vue components:
- Use Vue 3 Single File Component (SFC) format with <script setup lang="ts">.
- Use reactive primitives (ref, reactive, computed).
- Scoped CSS or Tailwind classes following Material design guidelines.
- Emit typed custom events and bind inputs with v-model.`,

  angular: `You are the Meo Angular Architecture Assistant.
When generating or modifying Angular components:
- Use modern Angular 17+ Standalone Component architecture.
- Include necessary imports (CommonModule, FormsModule, ReactiveFormsModule).
- Use strict TypeScript typing with clean signal or RxJS patterns where relevant.
- Follow Material design aesthetics.`,

  nodeBackend: `You are the Meo Node.js & Microservice Architecture Assistant.
When building scaffolding or backend integration:
- Create modular Express.js / Fastify services with clean CORS, file stream, and error handling.
- Organize endpoints for project generation, schema conversion, and code formatting.`,

  pythonMicroservice: `You are the Meo Python Analysis Microservice Assistant.
When providing AST parsing, code formatting, and schematic syntax analysis:
- Use Python 3.9+ with FastAPI or standard AST modules.
- Provide tokenization, linting, and semantic highlighting.`,
};

export function parsePromptToComponents(prompt: string): FlexComponent[] {
  const p = prompt.toLowerCase();
  const timestamp = Date.now();

  // Pattern 1: Login / Sign In Form
  if (p.includes('login') || p.includes('sign in') || p.includes('auth')) {
    return [
      {
        id: `ai-card-${timestamp}`,
        type: 'card',
        name: 'AI Generated Login',
        category: 'layout',
        isContainer: true,
        props: { title: 'Welcome Back', subtitle: 'Please enter your login details' },
        styles: {
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#1e293b',
          borderColor: '#3b82f6',
          borderWidth: '1px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        },
        events: [],
        children: [
          {
            id: `ai-input-email-${timestamp}`,
            type: 'input',
            name: 'Email Address',
            category: 'forms',
            props: { label: 'Email', placeholder: 'alex@company.com', inputType: 'email' },
            styles: { width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', textColor: '#f8fafc', borderColor: '#475569', borderWidth: '1px', borderRadius: '6px' },
            events: [],
          },
          {
            id: `ai-input-pass-${timestamp}`,
            type: 'input',
            name: 'Password',
            category: 'forms',
            props: { label: 'Password', placeholder: '••••••••', inputType: 'password' },
            styles: { width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', textColor: '#f8fafc', borderColor: '#475569', borderWidth: '1px', borderRadius: '6px' },
            events: [],
          },
          {
            id: `ai-checkbox-${timestamp}`,
            type: 'checkbox',
            name: 'Remember',
            category: 'forms',
            props: { label: 'Remember my session', checked: true },
            styles: { display: 'flex', alignItems: 'center', gap: '8px', textColor: '#cbd5e1', fontSize: '13px' },
            events: [],
          },
          {
            id: `ai-btn-submit-${timestamp}`,
            type: 'button',
            name: 'Sign In Button',
            category: 'buttons',
            props: { label: 'Sign In to Account', variant: 'contained' },
            styles: { width: '100%', padding: '12px', backgroundColor: '#2563eb', textColor: '#ffffff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center' },
            events: [{ event: 'onClick', functionName: 'onLoginSubmit', customCode: "alert('Logged in successfully!');" }],
          },
        ],
      },
    ];
  }

  // Pattern 2: Contact Form
  if (p.includes('contact') || p.includes('feedback') || p.includes('message')) {
    return [
      {
        id: `ai-contact-card-${timestamp}`,
        type: 'card',
        name: 'Contact Us Form',
        category: 'layout',
        isContainer: true,
        props: { title: 'Get in Touch', subtitle: "We'd love to hear from you." },
        styles: {
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#1e293b',
          borderColor: '#475569',
          borderWidth: '1px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        },
        events: [],
        children: [
          {
            id: `ai-cnt-name-${timestamp}`,
            type: 'input',
            name: 'Full Name',
            category: 'forms',
            props: { label: 'Your Name', placeholder: 'Jane Doe' },
            styles: { width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', textColor: '#f8fafc', borderColor: '#475569', borderWidth: '1px', borderRadius: '6px' },
            events: [],
          },
          {
            id: `ai-cnt-email-${timestamp}`,
            type: 'input',
            name: 'Email Address',
            category: 'forms',
            props: { label: 'Email', placeholder: 'jane@example.com', inputType: 'email' },
            styles: { width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', textColor: '#f8fafc', borderColor: '#475569', borderWidth: '1px', borderRadius: '6px' },
            events: [],
          },
          {
            id: `ai-cnt-msg-${timestamp}`,
            type: 'textarea',
            name: 'Message',
            category: 'forms',
            props: { label: 'Your Message', placeholder: 'How can we help?', rows: 4 },
            styles: { width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', textColor: '#f8fafc', borderColor: '#475569', borderWidth: '1px', borderRadius: '6px' },
            events: [],
          },
          {
            id: `ai-cnt-send-${timestamp}`,
            type: 'button',
            name: 'Send Button',
            category: 'buttons',
            props: { label: 'Send Message 🚀', variant: 'contained' },
            styles: { width: '100%', padding: '12px', backgroundColor: '#10b981', textColor: '#ffffff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center' },
            events: [{ event: 'onClick', functionName: 'sendMessage', customCode: "alert('Message dispatched!');" }],
          },
        ],
      },
    ];
  }

  // Pattern 3: Pricing / Tier Card
  if (p.includes('pricing') || p.includes('plan') || p.includes('tier') || p.includes('subscription')) {
    return [
      {
        id: `ai-pricing-card-${timestamp}`,
        type: 'card',
        name: 'Pro Tier Card',
        category: 'layout',
        isContainer: true,
        props: { title: 'Pro Plan', subtitle: 'Everything you need for scaling apps' },
        styles: {
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#1e293b',
          borderColor: '#8b5cf6',
          borderWidth: '2px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        },
        events: [],
        children: [
          {
            id: `ai-badge-tier-${timestamp}`,
            type: 'badge',
            name: 'Tier Badge',
            category: 'data-display',
            props: { text: 'MOST POPULAR' },
            styles: { padding: '4px 12px', backgroundColor: '#7c3aed', textColor: '#ffffff', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', alignSelf: 'flex-start' },
            events: [],
          },
          {
            id: `ai-price-heading-${timestamp}`,
            type: 'heading',
            name: 'Price Tag',
            category: 'typography',
            props: { text: '$29 / month', level: 'h1' },
            styles: { fontSize: '32px', fontWeight: '800', textColor: '#ffffff', margin: '0' },
            events: [],
          },
          {
            id: `ai-price-feature1-${timestamp}`,
            type: 'checkbox',
            name: 'Feature 1',
            category: 'forms',
            props: { label: 'Unlimited UI Canvas & Export', checked: true },
            styles: { display: 'flex', alignItems: 'center', gap: '8px', textColor: '#e2e8f0', fontSize: '13px' },
            events: [],
          },
          {
            id: `ai-price-feature2-${timestamp}`,
            type: 'checkbox',
            name: 'Feature 2',
            category: 'forms',
            props: { label: 'Instant React, Angular, Vue Porting', checked: true },
            styles: { display: 'flex', alignItems: 'center', gap: '8px', textColor: '#e2e8f0', fontSize: '13px' },
            events: [],
          },
          {
            id: `ai-btn-subscribe-${timestamp}`,
            type: 'button',
            name: 'Upgrade Button',
            category: 'buttons',
            props: { label: 'Start 14-Day Free Trial', variant: 'contained' },
            styles: { width: '100%', padding: '12px', backgroundColor: '#8b5cf6', textColor: '#ffffff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center' },
            events: [{ event: 'onClick', functionName: 'startTrial', customCode: "alert('Starting trial!');" }],
          },
        ],
      },
    ];
  }

  // Default: General Component Section with Heading, Paragraph, and Button
  return [
    {
      id: `ai-gen-container-${timestamp}`,
      type: 'container',
      name: 'Custom Section',
      category: 'layout',
      isContainer: true,
      props: {},
      styles: {
        width: '100%',
        padding: '24px',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: '1px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
      events: [],
      children: [
        {
          id: `ai-gen-title-${timestamp}`,
          type: 'heading',
          name: 'Generated Heading',
          category: 'typography',
          props: { text: prompt.length > 5 ? prompt.charAt(0).toUpperCase() + prompt.slice(1) : 'Generated Section', level: 'h2' },
          styles: { fontSize: '20px', fontWeight: '700', textColor: '#f8fafc', margin: '0' },
          events: [],
        },
        {
          id: `ai-gen-text-${timestamp}`,
          type: 'paragraph',
          name: 'Description',
          category: 'typography',
          props: { text: `Generated layout based on: "${prompt}". You can customize styles, properties, and event functions.` },
          styles: { fontSize: '14px', textColor: '#94a3b8', margin: '0' },
          events: [],
        },
        {
          id: `ai-gen-btn-${timestamp}`,
          type: 'button',
          name: 'Action Button',
          category: 'buttons',
          props: { label: 'Explore More', variant: 'contained' },
          styles: { padding: '10px 18px', backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', alignSelf: 'flex-start' },
          events: [{ event: 'onClick', functionName: 'handleClick', customCode: "console.log('Action triggered');" }],
        },
      ],
    },
  ];
}

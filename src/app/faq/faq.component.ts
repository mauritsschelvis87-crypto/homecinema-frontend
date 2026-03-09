import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  imports: [
    NgForOf
  ],
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faqs: FaqItem[] = [
    {
      question: 'Return Policy',
      answer: 'We accept returns within 14 days of delivery. Products must be unopened and in original condition. Contact customer service to start a return.',
      expanded: false
    },
    {
      question: 'Gift a Movie',
      answer: 'You can gift a movie by purchasing a gift code, which the recipient can redeem for their favorite film from our catalog.',
      expanded: false
    },
    {
      question: 'Shipping Costs',
      answer: 'Shipping costs depend on your EU country and the total weight of your order. All costs are calculated at checkout.',
      expanded: false
    },
    {
      question: 'Payment Methods',
      answer: 'We accept all major credit cards, PayPal, iDEAL, and bank transfers. Payment is processed securely at checkout.',
      expanded: false
    },
    {
      question: 'Order Tracking',
      answer: 'After your order ships, you will receive a tracking number by email to monitor your shipment’s progress.',
      expanded: false
    },
    {
      question: 'Gift Code Redemption',
      answer: 'To redeem a gift code, enter the unique code during checkout. The code applies to the eligible films and formats.',
      expanded: false
    },
    {
      question: 'Customer Support Contact',
      answer: 'You can reach customer support via email at support@homecinemaproject.com or call us at +31 20 123 4567 between 9am - 5pm CET.',
      expanded: false
    },
    {
      question: 'Can I change or cancel my order?',
      answer: 'Orders can be changed or canceled within 1 hour after placing. Contact customer service immediately to assist.',
      expanded: false
    },
    {
      question: 'Are your films available worldwide?',
      answer: 'Our films ship only within the EU due to distribution rights and shipping restrictions.',
      expanded: false
    },
    {
      question: 'How do I know if a film is available in 4K?',
      answer: 'Film details pages specify available formats including DVD, Blu-ray, and 4K UHD.',
      expanded: false
    },
    {
      question: 'What should I do if my shipment is delayed?',
      answer: 'Contact our support team with your order number. We will investigate and keep you informed.',
      expanded: false
    },
    {
      question: 'Can I combine multiple gift codes?',
      answer: 'Only one gift code can be used per order. You can place multiple orders if needed.',
      expanded: false
    },
    {
      question: 'Wat betekenen regio’s A, B en C?',
      answer: 'Films op DVD en Blu-ray zijn gecodeerd voor specifieke regio’s om afspelen te beperken. Regio A is voor Noord- en Zuid-Amerika en Oost-Azië, regio B voor Europa, Afrika, het Midden-Oosten en Australië, en regio C voor Centraal- en Zuid-Azië. Zorg dat je speler de juiste regio ondersteunt.',
      expanded: false
    },

    {
      question: 'Is personal data safe with you?',
      answer: 'We use industry-standard encryption and comply with GDPR to protect your data and privacy.',
      expanded: false
    }
  ];


  toggle(index: number): void {
    this.faqs[index].expanded = !this.faqs[index].expanded;
  }
}

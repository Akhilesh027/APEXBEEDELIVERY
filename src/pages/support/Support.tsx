import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Phone, Mail } from 'lucide-react';

export const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Support & Help Desk" subtitle="ApexBee Partner Operational Command Helpline" />

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-[#171717]">Contact Fleet Manager</h3>
        <p className="text-xs text-[#6B7280]">Reach out to your regional zone manager or technical helpdesk.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <a
            href="tel:+911800123456"
            className="p-4 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl flex items-center space-x-3 font-bold text-[#171717] hover:border-neutral-300"
          >
            <Phone className="h-5 w-5 text-[#16A34A]" />
            <div>
              <span className="block">Toll-Free Helpline</span>
              <span className="text-[10px] text-[#6B7280]">1800-123-4567</span>
            </div>
          </a>

          <a
            href="mailto:support@apexbee.in"
            className="p-4 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl flex items-center space-x-3 font-bold text-[#171717] hover:border-neutral-300"
          >
            <Mail className="h-5 w-5 text-[#2563EB]" />
            <div>
              <span className="block">Email Helpdesk</span>
              <span className="text-[10px] text-[#6B7280]">support@apexbee.in</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { OrderOfferSheet } from '../../components/orders/OrderOfferSheet';
import { EmptyState } from '../../components/common/EmptyState';

export const OrderOfferPage: React.FC = () => {
  const { activeOffer } = useAppStore();

  return (
    <div className="space-y-6">
      {!activeOffer ? (
        <EmptyState
          title="No Active Order Offers"
          description="You currently have no pending order assignments. Remain available in your delivery zone to receive new incoming orders from ApexBee network."
        />
      ) : (
        <OrderOfferSheet />
      )}
    </div>
  );
};

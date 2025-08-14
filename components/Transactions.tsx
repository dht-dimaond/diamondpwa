import React from 'react';

interface TransactionDetails {
  id: string;
  packageId: number;
  hashRate: number;
  priceTON: number;
  amount: number;
  date: string;
  boc: string;
  validity: string;
  item: number;
}

interface TransactionsListProps {
  transactions: TransactionDetails[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  return (
    <div className="max-w-4xl mx-auto rounded-lg p-6 bg-gradient-to-b from-gray-900/80 to-black/50">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Your Purchases</h2>
      {transactions.length === 0 ? (
        <p className="text-center text-white">You have not made any purchases yet.</p>
      ) : (
        transactions.map((tx, index) => (
          <div
            key={tx.id}
            className="shadow-md rounded-lg p-6 text-white mb-4 border border-gray-200"
          >
            <h3 className="text-xl text-white font-semibold mb-2">
              Purchase #{index + 1}
            </h3>
            <p>
              <span className="font-medium text-white">Item:</span> {tx.item} Gh/s
            </p>
            <p>
              <span className="font-medium text-white">Amount:</span> {tx.amount} TON
            </p>
            <p>
              <span className="font-medium text-white">Date:</span>{" "}
              {new Date(tx.date).toLocaleString()}
            </p>
            <p>
              <span className="font-medium text-white">Validity:</span> {tx.validity}
            </p>
            <p className="break-all">
              <span className="font-medium text-white">BlockChain Code:</span> {tx.boc}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionsList;
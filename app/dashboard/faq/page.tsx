import React from 'react';
import { Gem, Users, Cpu, CheckSquare, Rocket, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';



interface FeatureCardProps {
  //eslint-disable-next-line
  icon: React.ComponentType<any>;
  title: string;
  children: React.ReactNode;
}


const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, children }) => (
  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
    <div className="flex items-start space-x-3">
      <Icon className="w-6 h-6 text-indigo-400 mt-1 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-indigo-300 mb-2">{title}</h3>
        {children}
      </div>
    </div>
  </div>
);

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Welcome to Diamond Heist
        </h1>
        <p className="text-xl text-indigo-300">
          Your Ultimate Crypto Mining Adventure!
        </p>
      </div>

      {/* Project Overview */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 backdrop-blur-xl border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Gem className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-blue-400">Project Overview</h2>
        </div>
        <p className="text-gray-300 leading-relaxed">
          Prepare for the thrill of a lifetime with Diamond Heist, the most exciting Telegram mini app mining project set to take the crypto world by storm! 
          With our innovative approach, you will dive into a captivating experience that combines gaming and cryptocurrency, all while earning valuable
          <span className="text-blue-400 font-medium"> $DHT (Diamond Heist Tokens)</span>.
          With a total supply of <span className="font-bold text-blue-300">1,000,000,000 $DHT</span>, this project is poised to be the biggest talk of the season!
        </p>
      </div>

      
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-green-400 flex items-center space-x-2">
          <Award className="w-6 h-6" />
          <span>How to Earn $DHT Tokens</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={Users} title="Complete Referrals">
            <p className="text-gray-300">
              Refer at least <span className="text-green-400 font-bold">10 friends</span> to join the Diamond Heist community and unlock exclusive rewards.
            </p>
          </FeatureCard>
          <FeatureCard icon={Cpu} title="Rent Mining Machines">
          <h3 className="text-red-400 text-xl font-bold">Important note!!!</h3>
            <p className="text-gray-300">
              The worth of your hasrate is measured by how long it would take to mine 1000 tokens. Your miner stops after you have succesfully mined up to 100 tokens and can only be reactivated after you have claimed your tokens.
              Mine with the default hashrate or Boost your hash rate to earn more $DHT tokens faster and maximize your mining potential.
            </p>
          </FeatureCard>
          <FeatureCard icon={CheckSquare} title="Daily Tasks">
            <p className="text-gray-300">
              Engage with rewarding daily tasks to accumulate even more tokens.
            </p>
          </FeatureCard>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-purple-500/10 p-6 backdrop-blur-sm border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-purple-400">The Future</h2>
          </div>
          <p className="text-gray-300">
            Limited token supply and backing from major industry players (details coming soon) make this a project with immense potential. As demand for $DHT grows, so will its value!
          </p>
        </div>
      </div>

      <div className="text-center bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-lg p-8 backdrop-blur-xl border border-white/10">
        <p className="text-xl text-indigo-300 mb-4">
          Do not wait—join the Diamond Heist revolution today!
        </p>
        <Link href="/">
          <button className="group px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all duration-300 flex items-center space-x-2 mx-auto">
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default About;
"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CardList from "../components/CardList";

const stripePromise = loadStripe("pk_test_51RnsLKCLi8Bq7NWUnbwBTP7zvMrWlIIauNMx47smdfpFmh3dpgpmZ2MQnOwUGUezb6tnDcenLDQWocnfjH4Lavu900ZiE4qZtJ");

export default function Home() {
  const requesterId = "68ed47b64ed596d659c1ed92"; // usuario real
  const fixerId = "68ed473e4ed596d659c1ed8c"; // fixer real
  const jobId = "68ea51ee0d80087528ad803f"; // job real
  const amount = 300; 

  return (
    <Elements stripe={stripePromise}>
      <CardList
        requesterId={requesterId}
        fixerId={fixerId}
        jobId={jobId}
        amount={amount}
      />
    </Elements>
  );
}

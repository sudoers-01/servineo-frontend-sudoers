"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CardList from "../components/CardList";

const stripePromise = loadStripe("pk_test_51SHGq0Fp8K0s2pYx4l5z1fkIcXSouAknc9gUV6PpYKR8TjexmaC3OiJR9jNIa09e280Pa6jGVRA6ZNY7kSCCGcLt002CEmfDnU");

export default function Home() {
  const requesterId = "68ed47b64ed596d659c1ed8f"; // usuario real
  const fixerId = "68ed473e4ed596d659c1ed8c"; // fixer real
  const jobId = "68ea51ee0d80087528ad803f"; // job real
  const amount = 33300; 

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

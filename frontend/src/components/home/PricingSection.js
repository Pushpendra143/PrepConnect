import { Link } from 'react-router-dom';
import { Button } from "components/ui/button";
import { PLANS } from "utils/constants";

export default function PricingSection() {
  const userId = null;
  const isSignedIn = !!userId;
  const isOnStarter = false;
  const isOnPro = false;
  const isOnFree = true;

  const activePlanSlug = isOnPro
    ? "pro"
    : isOnStarter
    ? "starter"
    : isOnFree
    ? "free"
    : null;

  return (
    <div className="pricing-grid">
      {PLANS.map((plan) => {
        const isActive = activePlanSlug === plan.slug;

        return (
          <div
            key={plan.name}
            className={`pricing-card ${
              plan.featured ? "pricing-card-featured" : "pricing-card-default"
            } ${isActive ? "pricing-card-active" : ""}`}
          >
            {/* Most Popular badge */}
            {plan.featured && !isActive && (
              <span className="pricing-popular-badge">Most Popular</span>
            )}

            <p className="pricing-name">{plan.name}</p>

            <div className="pricing-price">
              <span
                className={`pricing-price-amount ${
                  plan.featured ? "text-gold-gradient" : "text-gray-gradient"
                }`}
              >
                {plan.price}
              </span>
              <span className="pricing-price-period">/month</span>
            </div>

            <p className="pricing-credits">{plan.credits}</p>

            <div className="pricing-divider" />

            <ul className="pricing-features">
              {plan.features.map((f) => (
                <li key={f} className="pricing-feature">
                  <span className="pricing-check">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {isActive ? (
              <Button
                variant={plan.featured ? "gold" : "default"}
                disabled
                className="w-full"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                ✓ Current plan
              </Button>
            ) : plan.planId === null ? (
              isSignedIn ? (
                <Button
                  variant="outline"
                  disabled
                  className="w-full"
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  Default plan
                </Button>
              ) : (
                <Link to="/login" style={{ width: '100%' }}>
                  <Button variant="outline" className="w-full">
                    Get started free
                  </Button>
                </Link>
              )
            ) : isSignedIn ? (
              <Button
                variant={plan.featured ? "gold" : "outline"}
                className="w-full"
              >
                {activePlanSlug === "pro" && plan.slug === "starter"
                  ? "Downgrade"
                  : activePlanSlug === "starter" && plan.slug === "pro"
                  ? "Upgrade →"
                  : "Get started →"}
              </Button>
            ) : (
              <Link to="/login" style={{ width: '100%' }}>
                <Button
                  variant={plan.featured ? "gold" : "outline"}
                  className="w-full"
                >
                  Get started →
                </Button>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

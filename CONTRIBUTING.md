# Contributing

Thank you for helping improve the Rotating Object Single-Photon LiDAR/ToF
Simulator.

## Before Opening an Issue

- Check whether the issue has already been reported.
- Include the browser, operating system, and steps needed to reproduce a bug.
- Include the simulation parameters when reporting unexpected output.
- For scientific or modeling questions, describe the expected physical
  behavior and provide a reference when possible.

## Pull Requests

1. Keep each pull request focused on one change.
2. Explain the motivation and user-visible effect.
3. Update the README when behavior, parameters, or data formats change.
4. Run the production build before submitting:

```bash
npm install
npm run build
```

## Simulation Model Changes

Changes to the photon statistics, geometry, timing, or exported binary format
should include:

- a short explanation of the physical assumption;
- the parameter range affected by the change;
- a reproducible example or validation method;
- any compatibility impact on previously exported data.

## Scope

This repository is an early-stage research simulator. Small, reviewable
improvements to documentation, reproducibility, validation, and usability are
preferred.

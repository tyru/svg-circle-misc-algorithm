(function () {
  'use strict';

  const CX = 250;
  const CY = 250;
  const KAPPA = (-1 + Math.sqrt(2)) / 3 * 4;
  const CIRCLE_STRATEGIES = {
    arc(r) {
      return [
        ['M', CX - r, CY],
        ['A', r, r, 0, 1, 0, CX + r, CY],
        ['A', r, r, 0, 1, 0, CX - r, CY],
      ];
    },
    cubic_bezier(r) {
      return [
        ['M', CX - r, CY],
        ['C', CX - r, CY - KAPPA * r, CX - KAPPA * r, CY - r, CX, CY - r],
        ['C', CX + KAPPA * r, CY - r, CX + r, CY - KAPPA * r, CX + r, CY],
        ['C', CX + r, CY + KAPPA * r, CX + KAPPA * r, CY + r, CX, CY + r],
        ['C', CX - KAPPA * r, CY + r, CX - r, CY + KAPPA * r, CX - r, CY],
      ];
    }
  };
  const CP_STRATEGIES = {
    arc(r) {
      return [[CX - r, CY], [CX + r, CY]];
    },
    cubic_bezier(r) {
      return [
        [CX - r, CY],
        [CX - r, CY - KAPPA * r], [CX - KAPPA * r, CY - r, {textX: CX - r - 50, textY: CY - r}],
        [CX, CY - r, {textX: CX - 40, textY: CY - r - 10}],
        [CX + KAPPA * r, CY - r], [CX + r, CY - KAPPA * r],
        [CX + r, CY],
        [CX + r, CY + KAPPA * r], [CX + KAPPA * r, CY + r],
        [CX, CY + r, {textX: CX - 40, textY: CY + r + 20}],
        [CX - KAPPA * r, CY + r, {textX: CX - r - 40, textY: CY + r + 20}], [CX - r, CY + KAPPA * r],
      ];
    }
  };

  new Vue({
    el: '#app',
    data: {
      width: '500px',
      height: '500px',
      r: '100',
      strategy: 'arc'
    },
    computed: {
      drawCircle() {
        const ops = this.getCirclePaths();
        return ops.map(op => op.join(' ')).join(' ');
      },
      pathLines() {
        return this.getCirclePaths()
          .map(op => [op[0], ... op.slice(1).map(Math.round)].join(' '));
      },
      drawControlPoints() {
        if (CP_STRATEGIES[this.strategy]) {
          const r = parseInt(this.r, 10);
          const points = CP_STRATEGIES[this.strategy].call(this, r);
          return points.map(p => ({
            x: p[0],
            y: p[1],
            textX: p[2] !== undefined ? p[2].textX : p[0] + 5,
            textY: p[2] !== undefined ? p[2].textY : p[1] + 20,
            r: '3px',
            text: this.getCoordText(p)
          }));
        }
        return [];
      },
    },
    methods: {
      getCirclePaths() {
        if (CIRCLE_STRATEGIES[this.strategy]) {
          return CIRCLE_STRATEGIES[this.strategy].call(this, parseInt(this.r, 10));
        }
        return [];
      },
      getCoordText(p) {
        const x = Math.round(p[0]);
        const y = Math.round(p[1]);
        return `(${x}, ${y})`;
      }
    }
  });

})();

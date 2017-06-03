(function () {
  'use strict';

  const CX = 250;
  const CY = 250;
  const KAPPA = (-1 + Math.sqrt(2)) / 3 * 4;

  class ArcStarategy {
    drawCircle(param) {
      const rx = param.rx;
      const ry = param.figure === 'circle' ? rx : param.ry;
      return [
        ['M', CX - rx, CY],
        ['A', rx, ry, 0, 1, 0, CX + rx, CY],
        ['A', rx, ry, 0, 1, 0, CX - rx, CY],
      ];
    }

    drawControlPoints(param) {
      const rx = param.rx;
      return [[CX - rx, CY], [CX + rx, CY]];
    }

    hasSupported(strategy) {
      return strategy === 'circle' ||
             strategy === 'ellipse';
    }
  }

  class CubicBezierStarategy {
    drawCircle(param) {
      const rx = param.rx;
      const ry = param.figure === 'circle' ? rx : param.ry;
      return [
        ['M', CX - rx, CY],
        ['C', CX - rx, CY - KAPPA * ry, CX - KAPPA * rx, CY - ry, CX, CY - ry],
        ['C', CX + KAPPA * rx, CY - ry, CX + rx, CY - KAPPA * ry, CX + rx, CY],
        ['C', CX + rx, CY + KAPPA * ry, CX + KAPPA * rx, CY + ry, CX, CY + ry],
        ['C', CX - KAPPA * rx, CY + ry, CX - rx, CY + KAPPA * ry, CX - rx, CY],
      ];
    }

    drawControlPoints(param) {
      const rx = param.rx;
      const ry = param.figure === 'circle' ? rx : param.ry;
      return [
        [CX - rx, CY],
        [CX - rx, CY - KAPPA * ry], [CX - KAPPA * rx, CY - ry, {textX: CX - rx - 50, textY: CY - ry}],
        [CX, CY - ry, {textX: CX - 40, textY: CY - ry - 10}],
        [CX + KAPPA * rx, CY - ry], [CX + rx, CY - KAPPA * ry],
        [CX + rx, CY],
        [CX + rx, CY + KAPPA * ry], [CX + KAPPA * rx, CY + ry],
        [CX, CY + ry, {textX: CX - 40, textY: CY + ry + 20}],
        [CX - KAPPA * rx, CY + ry, {textX: CX - rx - 40, textY: CY + ry + 20}], [CX - rx, CY + KAPPA * ry],
      ];
    }

    hasSupported(strategy) {
      return strategy === 'circle' ||
             strategy === 'ellipse';
    }
  }

  const STRATEGIES = {
    arc: new ArcStarategy,
    cubic_bezier: new CubicBezierStarategy,
  };

  new Vue({
    el: '#app',
    data: {
      width: '500px',
      height: '500px',
      figure: 'circle',
      rx: 100,
      ry: 100,
      strategy: 'arc',
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
        if (STRATEGIES[this.strategy]) {
          const param = this.makeParameter();
          const points = STRATEGIES[this.strategy].drawControlPoints(param);
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
        if (STRATEGIES[this.strategy]) {
          const param = this.makeParameter();
          return STRATEGIES[this.strategy].drawCircle(param)
        }
        return [];
      },
      getCoordText(p) {
        const x = Math.round(p[0]);
        const y = Math.round(p[1]);
        return `(${x}, ${y})`;
      },
      makeParameter() {
        return {
          r: this.rx,
          rx: this.rx,
          ry: this.ry,
          figure: this.figure,
        };
      },
      hasSupported(figure) {
        if (STRATEGIES[this.strategy]) {
          return STRATEGIES[this.strategy].hasSupported(figure);
        }
        return false;
      }
    }
  });

})();

classdef fun
% collection of static methods
% representing additional functions for qsp-mp
    methods (Static)
        function out = ifgt(x1, x2, y1, y2)
            if x1 > x2
                out = y1;
            else
                out = y2;
            end
        end
        function out = ifge(x1, x2, y1, y2)
            if x1 >= x2
                out = y1;
            else
                out = y2;
            end
        end
        function out = iflt(x1, x2, y1, y2)
            if x1 < x2
                out = y1;
            else
                out = y2;
            end
        end
        function out = ifle(x1, x2, y1, y2)
            if x1 <= x2
                out = y1;
            else
                out = y2;
            end
        end
        function out = ifeq(x1, x2, y1, y2)
            if x1 == x2
                out = y1;
            else
                out = y2;
            end
        end
    end
end

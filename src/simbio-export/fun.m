classdef fun
% collection of static methods
% representing additional functions for qsp-mp
    methods (Static)
        function out = ifg(x, y1, y2)
            if x > 0
                out = y1;
            else
                out = y2;
            end
        end
        function out = ifge(x, y1, y2)
            if x >= 0
                out = y1;
            else
                out = y2;
            end
        end
        function out = ife(x, y1, y2)
            if x == 0
                out = y1;
            else
                out = y2;
            end
        end
    end
end
